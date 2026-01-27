import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { profilePicUpload } from "../middlewares/profilePicUpload.middleware.js";
import {
  getProfile,
  followUser,
  unFollowUser,
  updateProfilePic,
  searchUsers,
  updateProfile,
  updateCoverPic
} from "../controllers/user.controller.js";

const router = express.Router();


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

router.put("/profile", authMiddleware, updateProfile);

router.put(
  "/cover-pic", 
  authMiddleware, 
  profilePicUpload.single("coverPic"),
  updateCoverPic
);

export default router;