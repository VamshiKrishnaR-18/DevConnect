
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import catchAsync from "../utils/catchAsync.js"; 
import AppError from "../utils/AppError.js";

import Comment from "../models/Comment.model.js";

import { SystemSetting } from "../models/SystemSetting.model.js";
import { AuditLog } from "../models/AuditLog.model.js";


//  DASHBOARD STATS 
export const getDashboardStats = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments();
  const activeUsers = await User.countDocuments({ isBanned: false });
  
  // Fetch logs for the dashboard widget
  const recentActivity = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("adminId", "username");

  res.json({ success: true, data: { totalUsers, totalPosts, activeUsers, recentActivity } });
});

// RECENT ACTIVITY 
export const getRecentActivity = catchAsync(async (req, res) => {
  const activities = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("adminId", "username");

  res.json({ success: true, data: { activities } });
});

// USER MANAGEMENT 
export const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  
  const query = {
    $or: [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  };

  const users = await User.find(query)
    .select("-password")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  });
});

export const banUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin") throw new AppError("Cannot ban an admin", 403);

  user.isBanned = !user.isBanned; // Toggle ban
  await user.save();

  await AuditLog.create({
    adminId: req.user._id,
    action: user.isBanned ? "BAN_USER" : "UNBAN_USER",
    targetId: userId,
    details: reason || "No reason provided"
  });

  res.json({ success: true, message: `User ${user.isBanned ? "banned" : "unbanned"}` });
});

// Backward compatibility
export const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);
  
  if (!user) throw new AppError("User not found", 404);

  await AuditLog.create({
    adminId: req.user._id,
    action: "DELETE_USER",
    targetId: userId,
    details: "Hard delete performed by admin"
  });

  res.json({ success: true, message: "User deleted permanently" });
});

// POST MANAGEMENT
export const getPosts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const users = await User.find({ username: { $regex: search, $options: "i" } }).select("_id");
  const userIds = users.map(u => u._id);

  const query = {
    $or: [
      { content: { $regex: search, $options: "i" } },
      { user: { $in: userIds } }
    ]
  };

  const posts = await Post.find(query)
    .populate("user", "username email profilepic")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Post.countDocuments(query);

  res.json({
    success: true,
    data: {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  });
});

export const deletePost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findByIdAndDelete(postId);
  if (!post) throw new AppError("Post not found", 404);

  await Comment.deleteMany({ post: postId });

  await AuditLog.create({
    adminId: req.user._id,
    action: "DELETE_POST",
    targetId: postId,
    details: `Deleted post by ${post.user}`
  });

  res.json({ success: true, message: "Post and associated comments deleted" });
});

//COMMENT MANAGEMENT
export const getComments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const users = await User.find({ username: { $regex: search, $options: "i" } }).select("_id");
  const userIds = users.map(u => u._id);

  const query = {
    $or: [
      { content: { $regex: search, $options: "i" } },
      { user: { $in: userIds } }
    ]
  };

  const comments = await Comment.find(query)
    .populate("user", "username profilepic")
    .populate("post", "content") 
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Comment.countDocuments(query);

  res.json({
    success: true,
    data: {
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  });
});

export const deleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) throw new AppError("Comment not found", 404);

  await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });

  await AuditLog.create({
    adminId: req.user._id,
    action: "DELETE_COMMENT",
    targetId: commentId,
    details: `Deleted comment: ${comment.content.substring(0, 20)}...`
  });

  res.json({ success: true, message: "Comment deleted" });
});

// SETTINGS MANAGEMENT
export const getSettings = catchAsync(async (req, res) => {
  const settings = await SystemSetting.find();
  const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  res.json({ success: true, data: settingsMap });
});

export const updateSettings = catchAsync(async (req, res) => {
  const { key, value } = req.body;
  
  await SystemSetting.findOneAndUpdate(
    { key },
    { key, value, updatedBy: req.user._id },
    { upsert: true, new: true }
  );

  await AuditLog.create({
    adminId: req.user._id,
    action: "UPDATE_SETTING",
    details: `Changed ${key} to ${value}`
  });

  res.json({ success: true, message: "Setting updated" });
});

export const getAllUsers = getUsers;