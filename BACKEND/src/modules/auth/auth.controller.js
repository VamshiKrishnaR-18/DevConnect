import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/User.model.js";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

import crypto from "crypto";

/* ===================== HELPERS ===================== */

const signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT secret not configured", 500);
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

};


const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return { resetToken, hashedToken };
};



/* ===================== REGISTER ===================== */

export const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exists) {
    return next(new AppError("User already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: "Registered successfully",
  });
});

/* ===================== LOGIN (USER) ===================== */

export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = signToken({ id: user._id });

  sendTokenCookie(res, token);

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilepic: user.profilepic,
    },
  });
});

/* ===================== LOGIN (ADMIN) ===================== */

export const loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) {
    return next(new AppError("Invalid credentials", 401));
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = signToken({
    id: admin._id,
    role: "admin",
  });

  sendTokenCookie(res, token);

  res.status(200).json({
    success: true,
    user: {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  });
});

/* ===================== LOGOUT ===================== */

export const logoutUser = (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/* ===================== GET CURRENT USER ===================== */

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};


/* ===================== FORGOT PASSWORD ===================== */

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save({ validateBeforeSave: false });

  // DEV ONLY: send token in response
  res.status(200).json({
    success: true,
    message: "Password reset token generated",
    resetToken, // ⛔ REMOVE in production
  });
});


/* ===================== RESET PASSWORD ===================== */

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }

  // Hash new password
  user.password = await bcrypt.hash(password, 10);

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

