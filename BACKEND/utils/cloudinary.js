import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// ----------------------------------------------------------------------
// 🚨 CRITICAL FIX: "multer-storage-cloudinary" is a CommonJS module.
// We must import the default 'pkg' and destructure it manually.
// ----------------------------------------------------------------------
import pkg from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg;

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Profile Pictures
export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

// Storage for Post Media (Images/Videos)
export const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "post_media",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "mov", "avi"],
    resource_type: "auto",
    transformation: [
      { width: 1080, height: 1080, crop: "limit" },
      { quality: "auto" }
    ],
  },
  timeout: 120000,
});

export default cloudinary;