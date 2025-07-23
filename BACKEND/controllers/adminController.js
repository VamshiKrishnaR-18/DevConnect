import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";

export const getUsers = async (req, res) => {
    try{
        const users = await userModel.find({}).select("-password");
        res.status(200).json({
            msg: "Users fetched successfully",
            users,
        });
    }
    catch(err){
        console.error("Get users error:", err);
        res.status(500).json({ msg: "Server error during get users" });
    }
}

export const getDashboardStats = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await userModel.countDocuments();

        // Get active users (users who have logged in within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = await userModel.countDocuments({
            lastLogin: { $gte: thirtyDaysAgo }
        });

        // Get total posts count
        const totalPosts = await postModel.countDocuments();

        // Get published posts count (assuming all posts are published for now)
        const publishedPosts = totalPosts;

        res.status(200).json({
            msg: "Dashboard stats fetched successfully",
            stats: {
                totalUsers,
                totalPosts,
                activeUsers,
                publishedPosts
            }
        });
    } catch (err) {
        console.error("Get dashboard stats error:", err);
        res.status(500).json({ msg: "Server error during get dashboard stats" });
    }
}

export const getRecentActivity = async (req, res) => {
    try {
        // Get recent users (last 5)
        const recentUsers = await userModel
            .find({})
            .select("username email createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent posts (last 5)
        const recentPosts = await postModel
            .find({})
            .populate("user", "username")
            .select("content user createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        // Format activity feed
        const activities = [];

        // Add user registrations
        recentUsers.forEach(user => {
            // Only add users that have valid data
            if (user.email && user.username) {
                activities.push({
                    type: 'user_registered',
                    message: `New user registered: ${user.email}`,
                    timestamp: user.createdAt,
                    user: user.username
                });
            }
        });

        // Add post creations
        recentPosts.forEach(post => {
            // Only add posts that have valid user data and content
            if (post.user && post.user.username && post.content) {
                const truncatedContent = post.content.substring(0, 50);
                activities.push({
                    type: 'post_created',
                    message: `Post published: "${truncatedContent}${post.content.length > 50 ? '...' : ''}"`,
                    timestamp: post.createdAt,
                    user: post.user.username
                });
            }
        });

        // Sort by timestamp and limit to 10 most recent
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivity = activities.slice(0, 10);

        res.status(200).json({
            msg: "Recent activity fetched successfully",
            activities: recentActivity
        });
    } catch (err) {
        console.error("Get recent activity error:", err);
        res.status(500).json({ msg: "Server error during get recent activity" });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Don't allow deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({ msg: "Cannot delete admin users" });
        }

        await userModel.findByIdAndDelete(userId);

        res.status(200).json({
            msg: "User deleted successfully"
        });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ msg: "Server error during delete user" });
    }
}

export const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
            msg: "Posts fetched successfully",
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        });
    } catch (err) {
        console.error("Get posts error:", err);
        res.status(500).json({ msg: "Server error during get posts" });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Check if post exists
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        await postModel.findByIdAndDelete(postId);

        res.status(200).json({
            msg: "Post deleted successfully"
        });
    } catch (err) {
        console.error("Delete post error:", err);
        res.status(500).json({ msg: "Server error during delete post" });
    }
}

// Simple in-memory settings store (in production, use database)
let systemSettings = {
    siteName: "DevConnect",
    siteDescription: "A platform for developers to connect and share",
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    maintenanceMode: false,
    registrationEnabled: true
};

export const getSettings = async (req, res) => {
    try {
        res.status(200).json({
            msg: "Settings fetched successfully",
            settings: systemSettings
        });
    } catch (err) {
        console.error("Get settings error:", err);
        res.status(500).json({ msg: "Server error during get settings" });
    }
}

export const updateSettings = async (req, res) => {
    try {
        const { siteName, siteDescription, sessionTimeout, maxLoginAttempts, maintenanceMode, registrationEnabled } = req.body;

        // Update settings with provided values
        if (siteName !== undefined) systemSettings.siteName = siteName;
        if (siteDescription !== undefined) systemSettings.siteDescription = siteDescription;
        if (sessionTimeout !== undefined) systemSettings.sessionTimeout = parseInt(sessionTimeout);
        if (maxLoginAttempts !== undefined) systemSettings.maxLoginAttempts = parseInt(maxLoginAttempts);
        if (maintenanceMode !== undefined) systemSettings.maintenanceMode = Boolean(maintenanceMode);
        if (registrationEnabled !== undefined) systemSettings.registrationEnabled = Boolean(registrationEnabled);

        res.status(200).json({
            msg: "Settings updated successfully",
            settings: systemSettings
        });
    } catch (err) {
        console.error("Update settings error:", err);
        res.status(500).json({ msg: "Server error during update settings" });
    }
}
