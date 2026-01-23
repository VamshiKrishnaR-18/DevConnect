import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/User.model.js";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

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
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
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
