import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Ensure environment variables are loaded
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug: Check if Cloudinary credentials are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️  Cloudinary credentials not properly configured. File uploads will fail.");
  console.log("Current values:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "undefined",
    api_key: process.env.CLOUDINARY_API_KEY ? "***" : "undefined",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : "undefined",
  });
} else {
  console.log("✅ Cloudinary credentials loaded successfully");

  // Test Cloudinary connection
  cloudinary.api.ping()
    .then(() => {
      console.log("✅ Cloudinary connection test successful");
    })
    .catch((error) => {
      console.error("❌ Cloudinary connection test failed:", error.message);
    });
}

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
    resource_type: "image",
  },
  timeout: 60000, // 60 second timeout
});

