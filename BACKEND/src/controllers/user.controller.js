import userModel from "../models/User.model.js";
import postModel from "../models/Post.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

import {
  followUserService,
  unfollowUserService,
  updateProfilePicService,
} from "../services/user.service.js";

import { SOCKET_EVENTS } from "../constants/socketEvents.js";
import { emitSocketEvent } from "../utils/emitSocketEvent.js";


//GET PROFILE
export const getProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await userModel
    .findOne({ username })
    .select("-password")
    
    .populate("followers", "username profilepic profilePic") 
    .populate("following", "username profilepic profilePic");

  if (!user) {
    return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
  }

  const posts = await postModel
    .find({ user: user._id })
  
    .populate("user", "username profilepic profilePic") 
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



//FOLLOW USER
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

//UNFOLLOW USER
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



//UPDATE PROFILE PIC
export const updateProfilePic = async (req, res) => {
  try {
    const updatedUser = await updateProfilePicService(req.user._id, req.file);

    res.status(200).json({
      success: true,
      message: "Profile picture updated",
      data: {
        user: updatedUser,
        profilePic: updatedUser.profilepic,
      },
    });
  } catch (error) {
    console.error("Error updating profile pic:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


//SEARCH USERS
export const searchUsers = catchAsync(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim() === "") {
    return res.status(200).json({ success: true, data: [] });
  }

  const users = await userModel
    .find({
      username: { $regex: query, $options: "i" },
    })
    .select("username profilepic profilePic")
    .limit(10); 

  res.status(200).json({
    success: true,
    data: users,
  });
});



//UPDATE USER PROFILE
export const updateProfile = catchAsync(async (req, res) => {
  const { username, bio } = req.body;
  
  if (!username) throw new AppError("Username cannot be empty", 400);

  if (username !== req.user.username) {
    const existing = await userModel.findOne({ username });
    if (existing) throw new AppError("Username already taken", 400);
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    { username, bio },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});



//UPDATE COVER PIC
export const updateCoverPic = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No image file provided", 400));
  }

  const coverUrl = req.file.path; 

  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    { coverPic: coverUrl },
    { new: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Cover photo updated successfully",
    data: updatedUser,
  });
});