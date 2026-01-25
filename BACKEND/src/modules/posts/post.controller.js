import postModel from "../../models/Post.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

import {createPost} from "../../services/post.service.js";

import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import { emitSocketEvent } from "../../utils/emitSocketEvent.js";

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

export const createMediaPost = catchAsync(async (req, res) => {
  const post = await createPostWithMedia({
    userId: req.user._id,
    content: req.body.content,
    files: req.files,
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

/* ===================== GET ALL POSTS ===================== */

export const getAllPosts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    postModel
      .find()
      .populate("user", "username profilepic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    postModel.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: page * limit < totalPosts,
        hasPrevPage: page > 1,
      },
    },
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
  const result = await toggleLikeService({
    postId: req.params.postId,
    userId: req.user._id,
  });

  const io = req.app.get("io");
  emitSocketEvent(io, SOCKET_EVENTS.POST_LIKED, {
    postId: result.postId,
    likes: result.likes,
  });

  res.status(200).json({
    success: true,
    message: result.liked ? "Post unliked" : "Post liked",
    data: { likes: result.likes },
  });
});
