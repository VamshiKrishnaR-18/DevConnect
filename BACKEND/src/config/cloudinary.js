import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Storage for Profile Pics
export const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "devconnect/profile_pics",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// 2. Storage for Post Media (REQUIRED FOR POSTS)
export const postMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "devconnect/posts",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi"],
    resource_type: "auto", // Important: Allows both images and videos
  },
});