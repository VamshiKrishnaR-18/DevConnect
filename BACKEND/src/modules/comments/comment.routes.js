import express from "express";

import {
  addComment,
  getComments,
  deleteComment,
} from "./comment.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  addCommentSchema,
  getCommentsSchema,
  deleteCommentSchema,
} from "../../validations/comment.validation.js";

const router = express.Router();

// Add comment
router.post(
  "/",
  authMiddleware,
  validate(addCommentSchema),
  addComment
);

// Get comments for a post
router.get(
  "/:postId",
  validate(getCommentsSchema),
  getComments
);

// Delete comment
router.delete(
  "/:commentId",
  authMiddleware,
  validate(deleteCommentSchema),
  deleteComment
);

export default router;
