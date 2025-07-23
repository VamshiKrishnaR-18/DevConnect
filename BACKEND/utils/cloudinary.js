import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Existing profile pic storage
export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

// New post media storage
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
