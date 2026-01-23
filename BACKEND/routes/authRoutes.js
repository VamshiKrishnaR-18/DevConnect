import express from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  getMe,
} from "../controllers/authController.js";

import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminProtect from "../middleware/adminMiddleware.js";

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
