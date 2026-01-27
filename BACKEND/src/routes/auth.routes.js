import express from "express";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

import {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

//AUTH

// Register
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerUser
);

// Login (user)
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  loginUser
);

// Login (admin)
router.post(
  "/admin/login",
  validate(loginSchema),
  loginAdmin
);

// Refresh token
router.post("/refresh", refreshAccessToken);

// Get current user
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", authMiddleware, logoutUser);

//PASSWORD

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
