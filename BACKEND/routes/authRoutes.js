import express from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

// ✅ USER AUTH CHECK
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

export default router;
