import express from "express";

import {
  getUsers,
  deleteUser,
  getDashboardStats,
  getRecentActivity,
  getPosts,
  deletePost,
  getSettings,
  updateSettings,
  banUser,
  getComments,
  deleteComment
} from "../controllers/admin.controller.js";


import protect from "../middlewares/auth.middleware.js"; 
import adminProtect from "../middlewares/admin.middleware.js"; 

import validate from "../middlewares/validate.middleware.js";
import {
  deleteUserSchema,
  deletePostSchema,
  updateSettingsSchema,
} from "../validations/admin.validation.js";

const router = express.Router();


router.use(protect, adminProtect);

//DASHBOARD
// /api/admin/stats
router.get("/stats", getDashboardStats); 

// /api/admin/activity
router.get("/activity", getRecentActivity);

//USERS
// /api/admin/users
router.get("/users", getUsers);

// /api/admin/users/:id/ban
router.post("/users/:userId/ban", banUser); 

// /api/admin/users/:id
router.delete(
  "/users/:userId",
  validate(deleteUserSchema),
  deleteUser
);

//POSTS
// /api/admin/posts
router.get("/posts", getPosts);

// /api/admin/posts/:id
router.delete(
  "/posts/:postId",
  validate(deletePostSchema),
  deletePost
);

//SETTINGS
// /api/admin/settings
router.get("/settings", getSettings);
router.put(
  "/settings",
  validate(updateSettingsSchema),
  updateSettings
);

//COMMENTS
router.get("/comments", getComments);
router.delete("/comments/:commentId", deleteComment);

export default router;