// src/services/auth.service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";

/* ===================== CONSTANTS ===================== */

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/* ===================== TOKEN HELPERS ===================== */

const signAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "JWT secret not configured",
      500,
      "JWT_SECRET_MISSING"
    );
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const signRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError(
      "JWT refresh secret not configured",
      500,
      "JWT_REFRESH_SECRET_MISSING"
    );
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
  });
};

/* ===================== LOGIN ===================== */

export const loginUserService = async ({
  email,
  password,
  role,
}) => {
  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400,
      "CREDENTIALS_REQUIRED"
    );
  }

  const query = role ? { email, role } : { email };

  // Explicitly include password
  const user = await User.findOne(query).select("+password");
  if (!user) {
    throw new AppError(
      "Invalid credentials",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(
      "Invalid credentials",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const accessToken = signAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user._id,
  });

  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt =
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
