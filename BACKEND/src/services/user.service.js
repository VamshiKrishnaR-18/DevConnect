// src/services/user.service.js
import userModel from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";

/* ===================== FOLLOW USER ===================== */

export const followUserService = async ({
  currentUserId,
  targetUserId,
}) => {
  if (currentUserId.equals(targetUserId)) {
    throw new AppError("You cannot follow yourself", 400, "SELF_FOLLOW");
  }

  const [currentUser, targetUser] = await Promise.all([
    userModel.findById(currentUserId),
    userModel.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (targetUser.followers.includes(currentUserId)) {
    throw new AppError(
      "You are already following this user",
      400,
      "ALREADY_FOLLOWING"
    );
  }

  await Promise.all([
    userModel.updateOne(
      { _id: targetUserId },
      { $addToSet: { followers: currentUserId } }
    ),
    userModel.updateOne(
      { _id: currentUserId },
      { $addToSet: { following: targetUserId } }
    ),
  ]);

  // 🔔 Persistent notification
  await createNotification({
    recipient: targetUserId,
    sender: currentUserId,
    type: "FOLLOW",
    message: "started following you",
  });

  const followersCount = targetUser.followers.length + 1;

  return {
    followerId: currentUserId,
    followedId: targetUserId,
    followersCount,
    events: [
      {
        type: "userFollowed",
        payload: {
          followerId: currentUserId,
          followedId: targetUserId,
          followersCount,
        },
      },
    ],
  };
};


/* ===================== UNFOLLOW USER ===================== */

export const unfollowUserService = async ({
  currentUserId,
  targetUserId,
}) => {
  if (currentUserId.equals(targetUserId)) {
    throw new AppError(
      "You cannot unfollow yourself",
      400,
      "SELF_UNFOLLOW"
    );
  }

  const [currentUser, targetUser] = await Promise.all([
    userModel.findById(currentUserId),
    userModel.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!targetUser.followers.includes(currentUserId)) {
    throw new AppError(
      "You are not following this user",
      400,
      "NOT_FOLLOWING"
    );
  }

  await Promise.all([
    userModel.updateOne(
      { _id: targetUserId },
      { $pull: { followers: currentUserId } }
    ),
    userModel.updateOne(
      { _id: currentUserId },
      { $pull: { following: targetUserId } }
    ),
  ]);

  const followersCount = targetUser.followers.length - 1;

  return {
    followerId: currentUserId,
    unfollowedId: targetUserId,
    followersCount,
    events: [
      {
        type: "userUnfollowed",
        payload: {
          followerId: currentUserId,
          unfollowedId: targetUserId,
          followersCount,
        },
      },
    ],
  };
};
