import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { profilePicUpload } from "../middlewares/profilePicUpload.middleware.js";
import {
  getProfile,
  followUser,
  unFollowUser,
  updateProfilePic,
  searchUsers, // <--- 1. Import this
} from "../controllers/user.controller.js";

const router = express.Router();

// 2. Add the Search Route
router.get("/search", authMiddleware, searchUsers);

router.get("/profile/:username", authMiddleware, getProfile);
router.post("/follow/:id", authMiddleware, followUser);
router.post("/unfollow/:id", authMiddleware, unFollowUser);

router.put(
  "/profile-pic",
  authMiddleware,
  profilePicUpload.single("profilePic"), 
  updateProfilePic
);

export default router;