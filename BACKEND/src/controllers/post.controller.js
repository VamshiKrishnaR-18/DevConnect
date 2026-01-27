import postModel from "../models/Post.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import Comment from "../models/Comment.model.js";


import {
  createPost,
  createPostWithMedia,
  deletePostService,
  toggleLikeService,
  addCommentService
} from "../services/post.service.js";

import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { emitSocketEvent } from "../utils/emitSocketEvent.js";



//CREATE POST (TEXT)

export const createTextPost = catchAsync(async (req, res) => {
  const post = await createPost({
    userId: req.user._id,
    content: req.body.content,
  });

  const io = req.app.get("io");
  emitSocketEvent(io, SOCKET_EVENTS.POST_CREATED, {
    post,
  });

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: { post },
  });
});



//CREATE POST (MEDIA)

export const createMediaPost = async (req, res, next) => {
  try {
    console.log("--> Debug: Controller started");
    console.log("--> Files received:", req.files ? req.files.length : "None");
    console.log("--> Body content:", req.body.content);

  
    const post = await createPostWithMedia({
      userId: req.user._id,
      content: req.body.content,
      files: req.files,
    });

    console.log("--> Debug: Post created successfully:", post._id);

    const io = req.app.get("io");
    emitSocketEvent(io, SOCKET_EVENTS.POST_CREATED, { post });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    
    console.error("❌ CRITICAL ERROR IN CREATE MEDIA POST ❌");
    console.error(error);
    console.error("------------------------------------------");
    
    res.status(500).json({ success: false, message: error.message });
  }
};




//GET ALL POSTS
export const getAllPosts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalPosts = await postModel.countDocuments();

  const posts = await postModel
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    
    .populate("user", "username profilepic") 
    
    .populate({
      path: "comments",
      select: "content createdAt",
      populate: {
        path: "user",
        select: "username profilepic" 
      }
    });

  res.status(200).json({
    success: true,
    results: posts.length,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: page * limit < totalPosts
      }
    },
  });
});



//GET POST BY ID

export const getPostById = catchAsync(async (req, res, next) => {
  const post = await postModel
    .findById(req.params.id)
    .populate("user", "username profilepic")
    .populate("comments.user", "username profilepic");

  if (!post) {
    return next(
      new AppError("Post not found", 404, "POST_NOT_FOUND")
    );
  }

  res.status(200).json({
    success: true,
    data: { post },
  });
});



//DELETE POST

export const deletePost = catchAsync(async (req, res) => {

  const result = await deletePostService({
    postId: req.params.id,
    userId: req.user._id,
  });

  const io = req.app.get("io");
  emitSocketEvent(io, SOCKET_EVENTS.POST_DELETED, {
    postId: result.postId,
  });

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});



//TOGGLE LIKE
export const toggleLike = catchAsync(async (req, res) => {
  
  const io = req.app.get("io");

  
  const result = await toggleLikeService({
    postId: req.params.postId,
    userId: req.user._id,
    io: io 
  });

  

  res.status(200).json({
    success: true,
    message: result.liked ? "Post liked" : "Post unliked",
    data: { likes: result.likes },
  });
});



//ADD COMMENT
export const addComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text) return next(new AppError("Comment text is required", 400));

  
  const post = await postModel.findById(postId);
  if (!post) return next(new AppError("Post not found", 404));

  
  const newComment = await Comment.create({
    content: text,       
    post: postId,
    user: req.user._id,
  });

  
  post.comments.push(newComment._id);
  await post.save();

  
  await newComment.populate("user", "username profilepic");

  res.status(201).json({
    success: true,
    data: newComment, 
    message: "Comment added successfully"
  });
});