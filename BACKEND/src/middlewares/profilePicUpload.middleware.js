import multer from "multer";
import { profilePicStorage } from "../config/cloudinary.js";

export const profilePicUpload = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("--> MIDDLEWARE: Processing file:", file.originalname, file.mimetype);
    if (file.mimetype.startsWith("image/")) {
      console.log("--> MIDDLEWARE: File accepted");
      cb(null, true);
    } else {
      console.error("--> MIDDLEWARE: File rejected (Not an image)");
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});