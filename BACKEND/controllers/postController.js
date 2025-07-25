import postModel from "../models/postModel.js";

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required" });
    }

    if (content.length > 1000) {
      return res
        .status(400)
        .json({ message: "Post content cannot exceed 1000 characters" });
    }

    const newPost = new postModel({
      content: content.trim(),
      user: req.user._id,
    });

    const savedPost = await newPost.save();

    // Populate user data for response
    await newPost.populate("user", "username profilepic");

    const io = req.app.get("io");
    io.emit("newPost", savedPost);

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (err) {
    console.error("Create post error:", err);

    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Failed to create post" });
  }
};

export const createPostWithMedia = async (req, res) => {
  try {
    console.log("=== CREATE POST WITH MEDIA DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("req.user:", req.user);

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "Post content cannot exceed 1000 characters" });
    }

    // Check if user exists
    if (!req.user || !req.user._id) {
      console.error("User not found in request");
      return res.status(401).json({ message: "User authentication failed" });
    }

    // Process uploaded media
    const media = [];
    if (req.files && req.files.length > 0) {
      console.log("Processing files:", req.files.length);
      for (const file of req.files) {
        console.log("File:", file);

        // Handle both Cloudinary and local storage
        const mediaItem = {
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          filename: file.originalname,
        };

        if (file.path && file.path.startsWith('http')) {
          // Cloudinary storage (URLs start with http)
          mediaItem.url = file.path;
          mediaItem.publicId = file.filename;
        } else if (file.filename) {
          // Local storage (file.path is local file system path)
          mediaItem.url = `/uploads/${file.filename}`;
          mediaItem.publicId = file.filename;
        } else {
          console.error("File missing path and filename:", file);
          continue;
        }

        media.push(mediaItem);
      }
    }

    console.log("Creating post with media:", media);

    const newPost = new postModel({
      content: content.trim(),
      user: req.user._id,
      media: media,
    });

    const savedPost = await newPost.save();
    await savedPost.populate("user", "username profilepic");

    const io = req.app.get("io");
    if (io) {
      io.emit("newPost", savedPost);
    }

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost
    });

  } catch (error) {
    console.error("Create post with media error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await postModel
      .find()
      .populate("user", "username profilepic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await postModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Get all posts error:", err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postModel
      .findById(id)
      .populate("user", "username profilepic")
      .populate("comments.user", "username profilepic");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error("Get post by ID error:", err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await postModel.findByIdAndDelete(id);

    const io = req.app.get("io");

    io.emit("postDeleted", id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const io = req.app.get("io");

    io.emit("postLiked", {
      postId: post._id,
      likes: post.likes,
    });

    return res.status(200).json({
      message: liked ? "post unliked" : "post liked",
      likes: post.likes,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Failed to  like" });
  }
};
