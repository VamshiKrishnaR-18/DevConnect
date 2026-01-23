import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentController.js";

import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  addCommentSchema,
  getCommentsSchema,
  deleteCommentSchema,
} from "../validations/comment.validation.js";

const router = express.Router();

// Add comment
router.post(
  "/",
  protect,
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
  protect,
  validate(deleteCommentSchema),
  deleteComment
);

export default router;
