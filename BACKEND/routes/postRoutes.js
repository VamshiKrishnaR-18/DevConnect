import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost
} from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes
router.post("/", protect, createPost);
router.delete("/:id", protect, deletePost);

export default router;