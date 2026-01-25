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
} from "../controllers/admin.controller.js";

import adminProtect from "../middlewares/admin.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  deleteUserSchema,
  deletePostSchema,
  updateSettingsSchema,
} from "../validations/admin.validation.js";

const router = express.Router();

/* ===================== DASHBOARD ===================== */
router.get("/dashboard/stats", adminProtect, getDashboardStats);
router.get("/dashboard/activity", adminProtect, getRecentActivity);

/* ===================== USERS ===================== */
router.get("/users", adminProtect, getUsers);
router.delete(
  "/users/:userId",
  adminProtect,
  validate(deleteUserSchema),
  deleteUser
);

/* ===================== POSTS ===================== */
router.get("/posts", adminProtect, getPosts);
router.delete(
  "/posts/:postId",
  adminProtect,
  validate(deletePostSchema),
  deletePost
);

/* ===================== SETTINGS ===================== */
router.get("/settings", adminProtect, getSettings);
router.put(
  "/settings",
  adminProtect,
  validate(updateSettingsSchema),
  updateSettings
);

export default router;
