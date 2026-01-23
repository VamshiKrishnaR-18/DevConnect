// src/middlewares/mediaUpload.middleware.js
import multer from "multer";
import { postMediaStorage } from "../config/cloudinary.js";

export const mediaUpload = multer({
  storage: postMediaStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 10,
  },
  fileFilter(req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mov",
      "video/avi",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only images and videos are allowed."),
        false
      );
    }

    cb(null, true);
  },
});
