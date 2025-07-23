import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { postMediaStorage } from "../utils/cloudinary.js";
import {
  createPost,
  createPostWithMedia,
  getAllPosts,
  deletePost
} from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local storage configuration as fallback
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Use Cloudinary if credentials are valid, otherwise use local storage
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME.trim() !== '' &&
  process.env.CLOUDINARY_API_KEY.trim() !== '' &&
  process.env.CLOUDINARY_API_SECRET.trim() !== '';

// Media upload configuration
const mediaUpload = multer({
  storage: isCloudinaryConfigured ? postMediaStorage : localStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per post
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed!'), false);
    }
  }
});

console.log(`📁 Post media using ${isCloudinaryConfigured ? 'Cloudinary' : 'local'} storage`);

// Routes
router.get("/", authMiddleware, getAllPosts);
router.post("/", authMiddleware, createPost);
router.post("/with-media", authMiddleware, mediaUpload.array('media', 5), createPostWithMedia);
router.delete("/:id", authMiddleware, deletePost);

export default router;
