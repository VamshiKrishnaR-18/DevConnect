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




//COOKIE HELPERS

const sendAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};




//REGISTER

export const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exists) {
    return next(new AppError("User already exists", 400, "USER_EXISTS"));
  }



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




//LOGIN (USER) 
export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService({ email, password });

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
      accessToken, 
    },
  });
});




//LOGIN (ADMIN)
export const loginAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService({
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
      accessToken, 
    },
  });
});




//REFRESH ACCESS TOKEN
export const refreshAccessToken = async (req, res, next) => {
  try {
    
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
    
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);


    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    
    const newAccessToken = signAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id });

    
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    
    sendAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: newAccessToken,
    });

  } catch (error) {
    
    console.error("Refresh Token Failed:", error.message);
    
   
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};




//LOGOUT

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



//GET CURRENT USER

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};



//FORGOT PASSWORD

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
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



//RESET PASSWORD

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
    return next(new AppError("Token is invalid or expired", 400, "INVALID_RESET_TOKEN"));
  }

  user.password = password; 
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});