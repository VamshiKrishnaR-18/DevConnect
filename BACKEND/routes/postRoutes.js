import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { postMediaStorage } from "../utils/cloudinary.js";

import {
  createPost,
  createPostWithMedia,
  getAllPosts,
  deletePost,
} from "../controllers/postController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  createPostSchema,
  deletePostSchema,
} from "../validations/post.validation.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== MULTER CONFIG ===================== */

const localStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "media-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
  process.env.CLOUDINARY_API_KEY?.trim() &&
  process.env.CLOUDINARY_API_SECRET?.trim();

const mediaUpload = multer({
  storage: isCloudinaryConfigured ? postMediaStorage : localStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 5,
  },
  fileFilter(req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mov",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});

/* ===================== ROUTES ===================== */

router.get("/", authMiddleware, getAllPosts);

router.post(
  "/",
  authMiddleware,
  validate(createPostSchema),
  createPost
);

router.post(
  "/with-media",
  authMiddleware,
  mediaUpload.array("media", 5),
  createPostWithMedia
);

router.delete(
  "/:id",
  authMiddleware,
  validate(deletePostSchema),
  deletePost
);

export default router;
