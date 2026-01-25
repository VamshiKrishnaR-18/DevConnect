import express from "express";

import {
  getProfile,
  followUser,
  unFollowUser,
  updateProfilePic,
} from "./user.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { profileUpload } from "../../middlewares/profileUpload.middleware.js";

import {
  getProfileSchema,
  followUserSchema,
  updateProfilePicSchema,
} from "../../validations/user.validation.js";

const router = express.Router();

/* ===================== ROUTES ===================== */

// Public
router.get(
  "/profile/:username",
  validate(getProfileSchema),
  getProfile
);

// Protected
router.put(
  "/follow/:id",
  authMiddleware,
  validate(followUserSchema),
  followUser
);

router.put(
  "/unfollow/:id",
  authMiddleware,
  validate(followUserSchema),
  unFollowUser
);

router.put(
  "/profile-pic",
  authMiddleware,
  profileUpload.single("profilePic"),
  updateProfilePic
);

export default router;
