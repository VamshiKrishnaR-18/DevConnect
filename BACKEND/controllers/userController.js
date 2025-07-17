import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await userModel
      .findOne({ username })
      .select("-password")
      .populate("followers", "username profilepic")
      .populate("following", "username profilepic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await postModel
      .find({ user: user._id })
      .populate("user", "username profilepic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      posts,
      totalPosts: posts.length
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await userModel.findById(req.user._id);
    const targetUser = await userModel.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.followers.includes(currentUser._id)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    targetUser.followers.push(currentUser._id);
    currentUser.following.push(targetUser._id);

    await targetUser.save();
    await currentUser.save();

    // Emit socket event for real-time updates
    const io = req.app.get("io");
    io.emit("userFollowed", {
      followerId: currentUser._id,
      followedId: targetUser._id,
      followersCount: targetUser.followers.length
    });

    res.status(200).json({
      message: "User followed successfully",
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error("Follow user error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unFollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const currentUser = await userModel.findById(req.user._id);
    const targetUser = await userModel.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser.followers.includes(currentUser._id)) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    targetUser.followers = targetUser.followers.filter(
      (followerId) => !followerId.equals(currentUser._id)
    );
    currentUser.following = currentUser.following.filter(
      (followingId) => !followingId.equals(targetUser._id)
    );

    await targetUser.save();
    await currentUser.save();

    // Emit socket event for real-time updates
    const io = req.app.get("io");
    io.emit("userUnfollowed", {
      followerId: currentUser._id,
      unfollowedId: targetUser._id,
      followersCount: targetUser.followers.length
    });

    res.status(200).json({
      message: "User unfollowed successfully",
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error("Unfollow user error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    console.log("Profile pic upload request received");
    console.log("User ID:", req.user?._id);
    console.log("File info:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : "No file");

    // Check if file was uploaded
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Handle both Cloudinary and local file paths
    let profilePicUrl;
    if (req.file.path && req.file.path.startsWith('http')) {
      // Cloudinary URL
      profilePicUrl = req.file.path;
    } else {
      // Local file - convert to server URL
      profilePicUrl = `/uploads/${req.file.filename}`;
    }
    console.log("Updating user profilepic to:", profilePicUrl);
    user.profilepic = profilePicUrl;

    await user.save();
    console.log("Profile picture updated successfully");

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilepic: user.profilepic
    });

  } catch(err) {
    console.error("Update profile pic error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}