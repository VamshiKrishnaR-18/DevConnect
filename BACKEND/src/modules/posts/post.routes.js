import express from "express";

import likeRoutes from "./like.routes.js";
import {
  createTextPost,
  createMediaPost,
  getAllPosts,
  deletePost,
} from "./post.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { mediaUpload } from "../../middlewares/mediaUpload.middleware.js";

import {
  createPostSchema,
  createPostWithMediaSchema,
  getPostsSchema,
  postIdParamSchema,
} from "../../validations/post.validation.js";

const router = express.Router();

/* ===================== ROUTES ===================== */

// Mount like routes
router.use("/", likeRoutes);

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

export default router;
