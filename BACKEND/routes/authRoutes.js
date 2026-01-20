import express from "express";
import { registerUser, loginUser, loginAdmin } from "../controllers/authController.js";
import adminProtect from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

router.get("/me", adminProtect, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out" });
});

export default router;
