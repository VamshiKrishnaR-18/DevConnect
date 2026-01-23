import express from "express";

import likeRoutes from "./like.routes.js";
import {
  createPost,
  createPostWithMedia,
  getAllPosts,
  deletePost,
} from "./post.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { mediaUpload } from "../../middlewares/mediaUpload.middleware.js";

import {
  createPostSchema,
  deletePostSchema,
} from "../../validations/post.validation.js";

const router = express.Router();

/* ===================== ROUTES ===================== */

// Mount like routes
router.use("/", likeRoutes);

// Get all posts
router.get("/", authMiddleware, getAllPosts);

// Create text post
router.post(
  "/",
  authMiddleware,
  validate(createPostSchema),
  createPost
);

// Create post with media
router.post(
  "/with-media",
  authMiddleware,
  mediaUpload.array("media", 5),
  createPostWithMedia
);

// Delete post
router.delete(
  "/:id",
  authMiddleware,
  validate(deletePostSchema),
  deletePost
);

export default router;
