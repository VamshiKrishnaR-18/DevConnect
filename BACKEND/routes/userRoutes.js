import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "../utils/cloudinary.js";

import {
  getProfile,
  followUser,
  unFollowUser,
  updateProfilePic,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  getProfileSchema,
  followUserSchema,
} from "../validations/user.validation.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== MULTER CONFIG ===================== */

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
  process.env.CLOUDINARY_API_KEY?.trim() &&
  process.env.CLOUDINARY_API_SECRET?.trim();

const upload = multer({
  storage: isCloudinaryConfigured ? storage : localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

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
  "/profilepic",
  authMiddleware,
  upload.single("profilepic"),
  updateProfilePic
);

export default router;
