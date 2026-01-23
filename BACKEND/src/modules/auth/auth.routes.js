import express from "express";

import {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  getMe,
} from "./auth.controller.js";

import validate from "../../middlewares/validate.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import adminProtect from "../../middlewares/admin.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "../../validations/auth.validation.js";

const router = express.Router();

/* ===================== AUTH ===================== */

// Register
router.post("/register", validate(registerSchema), registerUser);

// Login (user)
router.post("/login", validate(loginSchema), loginUser);

// Login (admin)
router.post("/admin/login", validate(loginSchema), loginAdmin);

// Get current user
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", authMiddleware, logoutUser);

export default router;
