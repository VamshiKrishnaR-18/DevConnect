import multer from "multer";
import { postMediaStorage } from "../config/cloudinary.js"; 

export const mediaUpload = multer({
  storage: postMediaStorage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});