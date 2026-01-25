import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

import { loginUserService } from "../services/auth.service.js"
import {
  signAccessToken,
  signRefreshToken,
} from "../utils/token.js";

/* ===================== COOKIE HELPERS ===================== */

const sendAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/* ===================== REGISTER ===================== */

export const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exists) {
    return next(
      new AppError("User already exists", 400, "USER_EXISTS")
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "Registered successfully",
  });
});

/* ===================== LOGIN (USER) ===================== */

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } =
    await loginUserService({ email, password });

  sendAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
      },
    },
  });
});

/* ===================== LOGIN (ADMIN) ===================== */

export const loginAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } =
    await loginUserService({
      email,
      password,
      role: "admin",
    });

  sendAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/* ===================== REFRESH ACCESS TOKEN ===================== */

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return next(
      new AppError("Refresh token missing", 401, "NO_REFRESH_TOKEN")
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch {
    return next(
      new AppError(
        "Invalid refresh token",
        401,
        "INVALID_REFRESH_TOKEN"
      )
    );
  }

  const user = await User.findById(decoded.id).select(
    "+refreshToken +refreshTokenExpiresAt"
  );

  if (
    !user ||
    user.refreshToken !== refreshToken ||
    user.refreshTokenExpiresAt < Date.now()
  ) {
    return next(
      new AppError("Session expired", 401, "SESSION_EXPIRED")
    );
  }

  const newAccessToken = signAccessToken({
    id: user._id,
    role: user.role,
  });

  const newRefreshToken = signRefreshToken({
    id: user._id,
  });

  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiresAt =
    Date.now() + 7 * 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  sendAuthCookies(res, newAccessToken, newRefreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed",
  });
});

/* ===================== LOGOUT ===================== */

export const logoutUser = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await User.updateOne(
      { refreshToken },
      { $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 } }
    );
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/* ===================== GET CURRENT USER ===================== */

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

/* ===================== FORGOT PASSWORD ===================== */

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError("User not found", 404, "USER_NOT_FOUND")
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // DEV ONLY
  res.status(200).json({
    success: true,
    message: "Password reset token generated",
    resetToken,
  });
});

/* ===================== RESET PASSWORD ===================== */

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // 1. Log the incoming token
  console.log("--> RESET PASSWORD DEBUG");
  console.log("1. Received Token:", token);

  // 2. Create the hash
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  console.log("2. Hashed Token:", hashedToken);

  // 3. Attempt to find the user
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log("3. User Found:", user ? user.username : "NO MATCH");

  if (!user) {
    // Debugging logic
    const expiredUser = await User.findOne({ resetPasswordToken: hashedToken });
    if (expiredUser) {
      console.log("--> ERROR: Token found but expired at", expiredUser.resetPasswordExpire);
    } else {
      console.log("--> ERROR: Token hash not found in DB at all.");
    }

    return next(
      new AppError(
        "Token is invalid or expired",
        400,
        "INVALID_RESET_TOKEN"
      )
    );
  }

  // 4. Update Password (FIX IS HERE)
  // We save the PLAIN password. The User Model's pre('save') hook will hash it automatically.
  user.password = password; 
  
  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // 5. Save user (Triggering the model's hashing hook)
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});