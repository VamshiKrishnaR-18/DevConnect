import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

/**
 * multer-storage-cloudinary is CommonJS,
 * so we must load it via createRequire
 */
const require = createRequire(import.meta.url);
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* ===================== CONFIG ===================== */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ===================== STORAGE ===================== */

// Post media storage
export const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "post_media",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "mov", "avi"],
    resource_type: "auto",
  },
});

// (optional) profile picture storage
export const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

export default cloudinary;
