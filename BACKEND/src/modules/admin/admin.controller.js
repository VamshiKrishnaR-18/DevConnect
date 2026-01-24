import userModel from "../../models/User.model.js";
import postModel from "../../models/Post.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

/* ===================== USERS ===================== */

export const getUsers = catchAsync(async (req, res) => {
  const users = await userModel.find().select("-password");

  res.status(200).json({
    success: true,
    data: { users },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
  }

  if (user.role === "admin") {
    return next(
      new AppError(
        "Cannot delete admin users",
        403,
        "ADMIN_DELETE_FORBIDDEN"
      )
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

/* ===================== DASHBOARD ===================== */

export const getDashboardStats = catchAsync(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, activeUsers, totalPosts] = await Promise.all([
    userModel.countDocuments(),
    userModel.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } }),
    postModel.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalPosts,
        activeUsers,
        publishedPosts: totalPosts,
      },
    },
  });
});

/* ===================== ACTIVITY ===================== */

export const getRecentActivity = catchAsync(async (req, res) => {
  const [recentUsers, recentPosts] = await Promise.all([
    userModel
      .find()
      .select("username email createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    postModel
      .find()
      .populate("user", "username")
      .select("content user createdAt")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const activities = [
    ...recentUsers.map((user) => ({
      type: "user_registered",
      message: `New user registered: ${user.email}`,
      timestamp: user.createdAt,
      user: user.username,
    })),
    ...recentPosts.map((post) => ({
      type: "post_created",
      message: `Post published: "${post.content.slice(0, 50)}${
        post.content.length > 50 ? "..." : ""
      }"`,
      timestamp: post.createdAt,
      user: post.user.username,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  res.status(200).json({
    success: true,
    data: { activities },
  });
});

/* ===================== POSTS ===================== */

export const getPosts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    postModel
      .find()
      .populate("user", "username email profilepic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    postModel.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: page * limit < totalPosts,
        hasPrevPage: page > 1,
      },
    },
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const post = await postModel.findById(postId);
  if (!post) {
    return next(new AppError("Post not found", 404, "POST_NOT_FOUND"));
  }

  await post.deleteOne();

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

export const getSettings = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { settings: systemSettings },
  });
});

export const updateSettings = catchAsync(async (req, res) => {
  Object.assign(systemSettings, {
    siteName: req.body.siteName ?? systemSettings.siteName,
    siteDescription:
      req.body.siteDescription ?? systemSettings.siteDescription,
    sessionTimeout:
      req.body.sessionTimeout !== undefined
        ? Number(req.body.sessionTimeout)
        : systemSettings.sessionTimeout,
    maxLoginAttempts:
      req.body.maxLoginAttempts !== undefined
        ? Number(req.body.maxLoginAttempts)
        : systemSettings.maxLoginAttempts,
    maintenanceMode:
      req.body.maintenanceMode !== undefined
        ? Boolean(req.body.maintenanceMode)
        : systemSettings.maintenanceMode,
    registrationEnabled:
      req.body.registrationEnabled !== undefined
        ? Boolean(req.body.registrationEnabled)
        : systemSettings.registrationEnabled,
  });

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: { settings: systemSettings },
  });
});
