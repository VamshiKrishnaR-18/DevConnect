import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";

// Load environment variables
dotenv.config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // New password for admin
    const newPassword = "admin123";

    // Find admin user
    const adminUser = await userModel.findOne({
      email: "admin@devconnect.com",
      role: "admin"
    });

    if (!adminUser) {
      console.log("❌ Admin user not found");
      process.exit(1);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log("✅ Admin password reset successfully!");
    console.log("\n🔑 Updated Admin Login Credentials:");
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log("\n🌐 Access admin panel at: http://localhost:5173/admin");
    console.log("\n⚠️  IMPORTANT: Change this password after logging in!");

  } catch (error) {
    console.error("❌ Error resetting admin password:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
    process.exit(0);
  }
};

resetAdminPassword();
