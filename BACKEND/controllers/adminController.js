import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

/* ===================== USERS ===================== */

export const getUsers = catchAsync(async (req, res, next) => {
  const users = await userModel.find({}).select("-password");

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    users,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role === "admin") {
    return next(new AppError("Cannot delete admin users", 403));
  }

  await userModel.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

/* ===================== DASHBOARD ===================== */

export const getDashboardStats = catchAsync(async (req, res, next) => {
  const totalUsers = await userModel.countDocuments();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await userModel.countDocuments({
    lastLogin: { $gte: thirtyDaysAgo },
  });

  const totalPosts = await postModel.countDocuments();

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    stats: {
      totalUsers,
      totalPosts,
      activeUsers,
      publishedPosts: totalPosts,
    },
  });
});

/* ===================== ACTIVITY ===================== */

export const getRecentActivity = catchAsync(async (req, res, next) => {
  const recentUsers = await userModel
    .find({})
    .select("username email createdAt")
    .sort({ createdAt: -1 })
    .limit(5);

  const recentPosts = await postModel
    .find({})
    .populate("user", "username")
    .select("content user createdAt")
    .sort({ createdAt: -1 })
    .limit(5);

  const activities = [];

  recentUsers.forEach(user => {
    if (user.email && user.username) {
      activities.push({
        type: "user_registered",
        message: `New user registered: ${user.email}`,
        timestamp: user.createdAt,
        user: user.username,
      });
    }
  });

  recentPosts.forEach(post => {
    if (post.user && post.user.username && post.content) {
      activities.push({
        type: "post_created",
        message: `Post published: "${post.content.substring(0, 50)}${
          post.content.length > 50 ? "..." : ""
        }"`,
        timestamp: post.createdAt,
        user: post.user.username,
      });
    }
  });

  activities.sort((a, b) => b.timestamp - a.timestamp);

  res.status(200).json({
    success: true,
    message: "Recent activity fetched successfully",
    activities: activities.slice(0, 10),
  });
});

/* ===================== POSTS ===================== */

export const getPosts = catchAsync(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await postModel
    .find({})
    .populate("user", "username email profilepic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await postModel.countDocuments();
  const totalPages = Math.ceil(totalPosts / limit);

  res.status(200).json({
    success: true,
    message: "Posts fetched successfully",
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const post = await postModel.findById(postId);
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  await postModel.findByIdAndDelete(postId);

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

/* ===================== SETTINGS ===================== */

// Temporary in-memory store
let systemSettings = {
  siteName: "DevConnect",
  siteDescription: "A platform for developers to connect and share",
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  maintenanceMode: false,
  registrationEnabled: true,
};

export const getSettings = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Settings fetched successfully",
    settings: systemSettings,
  });
});

export const updateSettings = catchAsync(async (req, res, next) => {
  const {
    siteName,
    siteDescription,
    sessionTimeout,
    maxLoginAttempts,
    maintenanceMode,
    registrationEnabled,
  } = req.body;

  if (siteName !== undefined) systemSettings.siteName = siteName;
  if (siteDescription !== undefined) systemSettings.siteDescription = siteDescription;
  if (sessionTimeout !== undefined) systemSettings.sessionTimeout = Number(sessionTimeout);
  if (maxLoginAttempts !== undefined) systemSettings.maxLoginAttempts = Number(maxLoginAttempts);
  if (maintenanceMode !== undefined) systemSettings.maintenanceMode = Boolean(maintenanceMode);
  if (registrationEnabled !== undefined) systemSettings.registrationEnabled = Boolean(registrationEnabled);

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    settings: systemSettings,
  });
});
