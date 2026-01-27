import express from "express";
import {
  createTextPost,
  createMediaPost,
  getAllPosts,
  deletePost,
  toggleLike, // <--- ADDED THIS
  addComment, // <--- ADDED THIS
} from "../controllers/post.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { mediaUpload } from "../middlewares/mediaUpload.middleware.js";

import {
  createPostSchema,
  createPostWithMediaSchema,
  getPostsSchema,
  postIdParamSchema,
} from "../validations/post.validation.js";

const router = express.Router();


// Get all posts
router.get(
  "/",
  authMiddleware,
  validate(getPostsSchema),
  getAllPosts
);

// Create text post
router.post(
  "/",
  authMiddleware,
  validate(createPostSchema),
  createTextPost
);

// Create post with media
router.post(
  "/with-media",
  authMiddleware,
  mediaUpload.array("media", 5),
  validate(createPostWithMediaSchema),
  createMediaPost
);

// Delete post
router.delete(
  "/:id",
  authMiddleware,
  validate(postIdParamSchema),
  deletePost
);


// Toggle Like
router.post(
  "/:postId/like", 
  authMiddleware, 
  toggleLike
);

// Add Comment
router.post(
  "/:postId/comment", 
  authMiddleware, 
  addComment
);

export default router;