import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin user details
    const adminData = {
      username: "admin",
      email: "admin@devconnect.com",
      password: "admin123", 
      role: "admin",
      bio: "System Administrator",
    };

    // Check if admin already exists with this specific email
    const existingAdmin = await userModel.findOne({
      email: adminData.email
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists:");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log("\n🔑 Use these credentials to login:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log("   Password: [Use the password you set when creating this user]");
      
      // If it's not an admin, update the role
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✅ Updated existing user to admin role");
      }
      
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const adminUser = new userModel({
      ...adminData,
      password: hashedPassword,
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("\n🔑 Admin Login Credentials:");
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log("\n🌐 Access admin panel at: http://localhost:5173/admin");
    console.log("\n⚠️  IMPORTANT: Change the default password after first login!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
createAdminUser();
