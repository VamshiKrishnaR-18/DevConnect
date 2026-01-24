import mongoose from "mongoose";
import Comment from "../../models/Comment.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

/* ===================== ADD COMMENT ===================== */

export const addComment = catchAsync(async (req, res, next) => {
  const { postId, text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(new AppError("Invalid postId", 400));
  }

  if (!text || !text.trim()) {
    return next(new AppError("Comment text is required", 400));
  }

  const comment = await Comment.create({
    postId,
    userId: req.user._id,
    text: text.trim(),
  });

  await comment.populate("userId", "username profilepic");

  const io = req.app.get("io");
  if (io) {
    io.emit("newComment", { postId, comment });
  }

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    comment,
  });
});

/* ===================== GET COMMENTS ===================== */

export const getComments = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(new AppError("Invalid postId", 400));
  }

  const comments = await Comment.find({ postId })
    .populate("userId", "username profilepic")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    comments,
  });
});

/* ===================== DELETE COMMENT ===================== */

export const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return next(new AppError("Invalid commentId", 400));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  if (comment.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only delete your own comments", 403));
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
