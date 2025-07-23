import express from "express";
import { registerUser, loginUser, loginAdmin } from "../controllers/authController.js";

const router = express.Router();

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

export default router;
