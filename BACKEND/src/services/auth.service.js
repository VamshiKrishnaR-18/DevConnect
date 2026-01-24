// src/services/auth.service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";

/* ===================== TOKEN HELPER ===================== */

const signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "JWT secret not configured",
      500,
      "JWT_SECRET_MISSING"
    );
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
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

  const tokenPayload = role
    ? { id: user._id, role }
    : { id: user._id };

  const token = signToken(tokenPayload);

  return { user, token };
};
