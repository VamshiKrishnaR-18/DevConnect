import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { profilePicUpload } from "../middlewares/profilePicUpload.middleware.js";
import {
  getProfile,
  followUser,
  unFollowUser,
  updateProfilePic,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", authMiddleware, getProfile);
router.post("/follow/:id", authMiddleware, followUser);
router.post("/unfollow/:id", authMiddleware, unFollowUser);

// Route with logging
router.put(
  "/profile-pic",
  authMiddleware,
  (req, res, next) => {
    console.log("--> BACKEND ROUTE: Request received at /profile-pic");
    next();
  },
  profilePicUpload.single("profilePic"), 
  updateProfilePic
);

export default router;