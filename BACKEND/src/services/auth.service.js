
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";

import {
  signAccessToken,
  signRefreshToken,
} from "../utils/token.js";

//CONSTANTS

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;



//LOGIN

export const loginUserService = async ({ email, password, role }) => {
  const query = role ? { email, role } : { email };

  const user = await User.findOne(query).select("+password +refreshToken");
  if (!user)
    throw new AppError("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new AppError("Invalid credentials", 401);

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};
