import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "../utils/cloudinary.js";
// import upload from "multer-storage-cloudinary";
import { updateProfilePic } from "../controllers/userController.js";
import {
  getProfile,
  followUser,
  unFollowUser,
} from "../controllers/userController.js";
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
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Use Cloudinary if credentials are valid, otherwise use local storage
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'devconnect' &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'devconnect' &&
  process.env.CLOUDINARY_API_KEY !== 'devconnect';

const upload = multer({
  storage: isCloudinaryConfigured ? storage : localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

console.log(`📁 Using ${isCloudinaryConfigured ? 'Cloudinary' : 'local'} storage for file uploads`);

// Public routes
router.get("/profile/:username", getProfile);

// Protected routes
router.put("/follow/:id", authMiddleware, followUser);
router.put("/unfollow/:id", authMiddleware, unFollowUser);
router.put('/profilepic', authMiddleware, upload.single('profilepic'), updateProfilePic);

export default router;
