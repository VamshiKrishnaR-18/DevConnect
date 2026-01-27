import userModel from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "./notification.service.js";

//FOLLOW USER
export const followUserService = async ({ currentUserId, targetUserId }) => {
  console.log("🔍 DEBUG: Follow Service Called");
  console.log(`   - Current User ID: ${currentUserId}`);
  console.log(`   - Target User ID:  ${targetUserId}`);

  if (currentUserId.equals(targetUserId)) {
    console.error("❌ DEBUG: Failed - Self Follow");
    throw new AppError("You cannot follow yourself", 400, "SELF_FOLLOW");
  }


  const currentUser = await userModel.findById(currentUserId);
  const targetUser = await userModel.findById(targetUserId);

 
  if (!currentUser) console.error(`❌ DEBUG: Current User (${currentUserId}) NOT found in DB`);
  if (!targetUser)  console.error(`❌ DEBUG: Target User (${targetUserId}) NOT found in DB`);

  if (!currentUser || !targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }


  if (targetUser.followers.includes(currentUserId)) {
    console.error("❌ DEBUG: Failed - Already Following");
    throw new AppError("You are already following this user", 400, "ALREADY_FOLLOWING");
  }

  console.log("✅ DEBUG: All checks passed. Updating DB...");

  await Promise.all([
    userModel.updateOne({ _id: targetUserId }, { $addToSet: { followers: currentUserId } }),
    userModel.updateOne({ _id: currentUserId }, { $addToSet: { following: targetUserId } }),
  ]);



  return {
    followerId: currentUserId,
    followedId: targetUserId,
    followersCount: targetUser.followers.length + 1,
    events: [],
  };
};

//UNFOLLOW USER
export const unfollowUserService = async ({ currentUserId, targetUserId }) => {
  if (currentUserId.equals(targetUserId)) {
    throw new AppError("You cannot unfollow yourself", 400, "SELF_UNFOLLOW");
  }

  const [currentUser, targetUser] = await Promise.all([
    userModel.findById(currentUserId),
    userModel.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!targetUser.followers.includes(currentUserId)) {
    throw new AppError("You are not following this user", 400, "NOT_FOLLOWING");
  }

  await Promise.all([
    userModel.updateOne({ _id: targetUserId }, { $pull: { followers: currentUserId } }),
    userModel.updateOne({ _id: currentUserId }, { $pull: { following: targetUserId } }),
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

//UPDATE PROFILE PIC
export const updateProfilePicService = async (userId, file) => {
  console.log("--> SERVICE: Updating user", userId);
  
  if (!file) {
    throw new AppError("Please upload an image", 400);
  }

  const updateData = {
    profilepic: {
      url: file.path,
      publicId: file.filename,
    },
  };
  
  console.log("--> SERVICE: Data to save to DB:", JSON.stringify(updateData, null, 2));

  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    updateData,
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    console.error("--> SERVICE ERROR: User not found in DB");
    throw new AppError("User not found", 404);
  }

  console.log("--> SERVICE: DB Update successful");
  return updatedUser;
};