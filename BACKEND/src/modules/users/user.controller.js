import userModel from "../../models/User.model.js";
import postModel from "../../models/Post.model.js";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

/* ===================== GET PROFILE ===================== */

export const getProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await userModel
    .findOne({ username })
    .select("-password")
    .populate("followers", "username profilepic")
    .populate("following", "username profilepic");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const posts = await postModel
    .find({ user: user._id })
    .populate("user", "username profilepic")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    user,
    posts,
    totalPosts: posts.length,
  });
});

/* ===================== FOLLOW USER ===================== */

export const followUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    return next(new AppError("You cannot follow yourself", 400));
  }

  const currentUser = await userModel.findById(req.user._id);
  const targetUser = await userModel.findById(id);

  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  if (targetUser.followers.includes(currentUser._id)) {
    return next(new AppError("You are already following this user", 400));
  }

  targetUser.followers.push(currentUser._id);
  currentUser.following.push(targetUser._id);

  await targetUser.save();
  await currentUser.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("userFollowed", {
      followerId: currentUser._id,
      followedId: targetUser._id,
      followersCount: targetUser.followers.length,
    });
  }

  res.status(200).json({
    success: true,
    message: "User followed successfully",
    followersCount: targetUser.followers.length,
  });
});

/* ===================== UNFOLLOW USER ===================== */

export const unFollowUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    return next(new AppError("You cannot unfollow yourself", 400));
  }

  const currentUser = await userModel.findById(req.user._id);
  const targetUser = await userModel.findById(id);

  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  if (!targetUser.followers.includes(currentUser._id)) {
    return next(new AppError("You are not following this user", 400));
  }

  targetUser.followers = targetUser.followers.filter(
    (followerId) => !followerId.equals(currentUser._id)
  );

  currentUser.following = currentUser.following.filter(
    (followingId) => !followingId.equals(targetUser._id)
  );

  await targetUser.save();
  await currentUser.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("userUnfollowed", {
      followerId: currentUser._id,
      unfollowedId: targetUser._id,
      followersCount: targetUser.followers.length,
    });
  }

  res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
    followersCount: targetUser.followers.length,
  });
});

/* ===================== UPDATE PROFILE PIC ===================== */

export const updateProfilePic = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  //  Always point to correct public path
  const profilePicUrl = `/uploads/profile/${req.file.filename}`;

  user.profilepic = profilePicUrl;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    profilepic: user.profilepic,
  });
});
