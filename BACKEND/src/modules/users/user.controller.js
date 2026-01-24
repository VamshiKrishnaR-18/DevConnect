import userModel from "../../models/User.model.js";
import postModel from "../../models/Post.model.js";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

import {
  followUserService,
  unfollowUserService,
} from "../../services/user.service.js";

import { SOCKET_EVENTS } from "../../constants/socketEvents.js";
import { emitSocketEvent } from "../../utils/emitSocketEvent.js";

/* ===================== GET PROFILE ===================== */

export const getProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await userModel
    .findOne({ username })
    .select("-password")
    .populate("followers", "username profilepic")
    .populate("following", "username profilepic");

  if (!user) {
    return next(
      new AppError("User not found", 404, "USER_NOT_FOUND")
    );
  }

  const posts = await postModel
    .find({ user: user._id })
    .populate("user", "username profilepic")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      user,
      posts,
      totalPosts: posts.length,
    },
  });
});

/* ===================== FOLLOW USER ===================== */

export const followUser = catchAsync(async (req, res) => {
  const result = await followUserService({
    currentUserId: req.user._id,
    targetUserId: req.params.id,
  });

  const io = req.app.get("io");
  if (result.events) {
    result.events.forEach((event) => {
      emitSocketEvent(io, SOCKET_EVENTS.USER_FOLLOWED, event.payload);
    });
  }

  res.status(200).json({
    success: true,
    message: "User followed successfully",
    data: {
      followersCount: result.followersCount,
    },
  });
});

/* ===================== UNFOLLOW USER ===================== */

export const unFollowUser = catchAsync(async (req, res) => {
  const result = await unfollowUserService({
    currentUserId: req.user._id,
    targetUserId: req.params.id,
  });

  const io = req.app.get("io");
  if (result.events) {
    result.events.forEach((event) => {
      emitSocketEvent(io, SOCKET_EVENTS.USER_UNFOLLOWED, event.payload);
    });
  }

  res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
    data: {
      followersCount: result.followersCount,
    },
  });
});

/* ===================== UPDATE PROFILE PIC ===================== */

export const updateProfilePic = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError("No file uploaded", 400, "NO_FILE")
    );
  }

  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(
      new AppError("User not found", 404, "USER_NOT_FOUND")
    );
  }

  const profilePicUrl = `/uploads/profile/${req.file.filename}`;

  user.profilepic = profilePicUrl;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    data: {
      profilepic: user.profilepic,
    },
  });
});
