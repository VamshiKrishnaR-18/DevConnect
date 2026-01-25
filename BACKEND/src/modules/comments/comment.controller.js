import Comment from "../../models/Comment.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

import {
  addCommentService,
  deleteCommentService,
} from "../../services/comment.service.js";

import { emitSocketEvent } from "../../utils/emitSocketEvent.js";

/* ===================== ADD COMMENT ===================== */

export const addComment = catchAsync(async (req, res) => {
  const result = await addCommentService({
    postId: req.body.postId,
    userId: req.user._id,
    text: req.body.text,
  });

  const io = req.app.get("io");
  if (io && result.events?.length) {
    result.events.forEach((event) =>
      emitSocketEvent(io, event.type, event.payload)
    );
  }

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: { comment: result.comment },
  });
});

/* ===================== GET COMMENTS ===================== */

export const getComments = catchAsync(async (req, res) => {
  const comments = await Comment.find({
    postId: req.params.postId,
  })
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

  const io = req.app.get("io");
  if (io) {
    emitSocketEvent(io, "commentDeleted", {
      commentId: req.params.commentId,
    });
  }

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
