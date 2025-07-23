import express from "express";
import {
  getUsers,
  deleteUser,
  getDashboardStats,
  getRecentActivity,
  getPosts,
  deletePost,
  getSettings,
  updateSettings
} from "../controllers/adminController.js";
import adminProtect from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard/stats", adminProtect, getDashboardStats);
router.get("/dashboard/activity", adminProtect, getRecentActivity);

// User management routes
router.get("/users", adminProtect, getUsers);
router.delete("/users/:userId", adminProtect, deleteUser);

// Post management routes
router.get("/posts", adminProtect, getPosts);
router.delete("/posts/:postId", adminProtect, deletePost);

// Settings routes
router.get("/settings", adminProtect, getSettings);
router.put("/settings", adminProtect, updateSettings);

export default router;
