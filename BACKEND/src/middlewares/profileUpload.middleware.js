import multer from "multer";
import { profilePicStorage } from "../config/cloudinary.js";

export const profileUpload = multer({
  storage: profilePicStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});
