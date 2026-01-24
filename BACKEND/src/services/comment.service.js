import mongoose from "mongoose";
import Comment from "../models/Comment.model.js";
import Post from "../models/Post.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";

/* ===================== ADD COMMENT ===================== */

export const addCommentService = async ({ postId, userId, text }) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError(
      "Invalid postId",
      400,
      "INVALID_POST_ID"
    );
  }

  if (!text || !text.trim()) {
    throw new AppError(
      "Comment text is required",
      400,
      "COMMENT_TEXT_REQUIRED"
    );
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(
      "Post not found",
      404,
      "POST_NOT_FOUND"
    );
  }

  const comment = await Comment.create({
    postId,
    userId,
    text: text.trim(),
  });

  await comment.populate("userId", "username profilepic");

  // 🔔 Create notification ONLY if not self-comment
  if (!post.user.equals(userId)) {
    await createNotification({
      recipient: post.user,
      sender: userId,
      type: "COMMENT",
      post: postId,
      message: "commented on your post",
    });
  }

  return {
    comment,
    events: [
      {
        type: "newComment",
        payload: {
          postId,
          comment,
        },
      },
    ],
  };
};

/* ===================== DELETE COMMENT ===================== */

export const deleteCommentService = async ({ commentId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError(
      "Invalid commentId",
      400,
      "INVALID_COMMENT_ID"
    );
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(
      "Comment not found",
      404,
      "COMMENT_NOT_FOUND"
    );
  }

  if (!comment.userId.equals(userId)) {
    throw new AppError(
      "You can only delete your own comments",
      403,
      "FORBIDDEN_COMMENT_DELETE"
    );
  }

  await Comment.deleteOne({ _id: commentId });

  return { commentId };
};
