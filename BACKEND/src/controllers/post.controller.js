import postModel from "../models/Post.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// FIX: Added missing imports for media, delete, and like services
import {
  createPost,
  createPostWithMedia,
  deletePostService,
  toggleLikeService,
  addCommentService
} from "../services/post.service.js";

import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { emitSocketEvent } from "../utils/emitSocketEvent.js";

/* ===================== CREATE POST (TEXT) ===================== */

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

/* ===================== CREATE POST (MEDIA) ===================== */

export const createMediaPost = async (req, res, next) => {
  try {
    console.log("--> Debug: Controller started");
    console.log("--> Files received:", req.files ? req.files.length : "None");
    console.log("--> Body content:", req.body.content);

    // Call the service
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
    // THIS IS THE IMPORTANT PART
    console.error("❌ CRITICAL ERROR IN CREATE MEDIA POST ❌");
    console.error(error); // This prints the full error object
    console.error("------------------------------------------");
    
    // Send 500
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===================== GET ALL POSTS ===================== */

/* ===================== GET ALL POSTS ===================== */
export const getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await postModel
    .find()
    // CRITICAL: Must populate 'user' and include 'profilepic'
    .populate("user", "username profilepic") 
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: posts.length,
    data: posts,
  });
});

/* ===================== GET POST BY ID ===================== */

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

/* ===================== DELETE POST ===================== */

export const deletePost = catchAsync(async (req, res) => {
  // deletePostService is now imported and will work
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

/* ===================== TOGGLE LIKE ===================== */
export const toggleLike = catchAsync(async (req, res) => {
  // 1. Get IO instance FIRST
  const io = req.app.get("io");

  // 2. Pass 'io' to the service
  const result = await toggleLikeService({
    postId: req.params.postId,
    userId: req.user._id,
    io: io // <--- PASS IT HERE
  });

  // (You can remove the manual emitSocketEvent here if the service handles notifications now)

  res.status(200).json({
    success: true,
    message: result.liked ? "Post liked" : "Post unliked",
    data: { likes: result.likes },
  });
});

/* ===================== ADD COMMENT ===================== */
export const addComment = catchAsync(async (req, res) => {
  // 1. Get IO instance FIRST
  const io = req.app.get("io");

  // 2. Pass 'io' to the service
  const comments = await addCommentService({
    postId: req.params.postId,
    userId: req.user._id,
    text: req.body.text,
    io: io // <--- PASS IT HERE
  });

  res.status(200).json({
    success: true,
    message: "Comment added",
    data: { comments },
  });
});