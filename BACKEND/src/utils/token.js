import jwt from "jsonwebtoken";
import AppError from "./AppError.js";

export const signAccessToken = (payload) => {
  if (!process.env.JWT_SECRET)
    throw new AppError("JWT secret missing", 500);

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const signRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new AppError("JWT refresh secret missing", 500);

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
