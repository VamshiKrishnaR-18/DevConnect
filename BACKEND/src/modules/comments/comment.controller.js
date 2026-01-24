import mongoose from "mongoose";

import Comment from "../../models/Comment.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

import {
  addCommentService,
  deleteCommentService,
} from "../../services/comment.service.js";

import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import { emitSocketEvent } from "../../utils/emitSocketEvent.js";

/* ===================== ADD COMMENT ===================== */

export const addComment = catchAsync(async (req, res) => {
  const result = await addCommentService({
    postId: req.body.postId,
    userId: req.user._id,
    text: req.body.text,
  });

  const io = req.app.get("io");
  if (result.events) {
    result.events.forEach((event) => {
      emitSocketEvent(io, event.type, event.payload);
    });
  }

  res.status(201).json({
    success: true,
    data: {
      comment: result.comment,
    },
    message: "Comment added successfully",
  });
});

/* ===================== GET COMMENTS ===================== */

export const getComments = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return next(
      new AppError("Invalid postId", 400, "INVALID_POST_ID")
    );
  }

  const comments = await Comment.find({ postId })
    .populate("userId", "username profilepic")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { comments },
  });
});

/* ===================== DELETE COMMENT ===================== */

export const deleteComment = catchAsync(async (req, res) => {
  await deleteCommentService({
    commentId: req.params.commentId,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
