import postModel from "../../models/Post.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

/* ===================== CREATE POST (TEXT) ===================== */

export const createPost = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return next(new AppError("Post content is required", 400));
  }

  const post = await postModel.create({
    content: content.trim(),
    user: req.user._id,
  });

  await post.populate("user", "username profilepic");

  const io = req.app.get("io");
  if (io) {
    io.emit("newPost", post);
  }

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    post,
  });
});

/* ===================== CREATE POST (MEDIA) ===================== */

export const createPostWithMedia = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  const hasContent = content && content.trim().length > 0;
  const hasMedia = req.files && req.files.length > 0;

  const media = [];

  if (hasMedia) {
    for (const file of req.files) {
      const mediaItem = {
        type: file.mimetype.startsWith("image/") ? "image" : "video",
        filename: file.originalname,
      };

      if (file.path?.startsWith("http")) {
        mediaItem.url = file.path;
        mediaItem.publicId = file.filename;
      } else {
        mediaItem.url = `/uploads/${file.filename}`;
        mediaItem.publicId = file.filename;
      }

      media.push(mediaItem);
    }
  }

  const post = await postModel.create({
    content: hasContent ? content.trim() : "",
    user: req.user._id,
    media,
  });

  await post.populate("user", "username profilepic");

  const io = req.app.get("io");
  if (io) {
    io.emit("newPost", post);
  }

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    post,
  });
});

/* ===================== GET ALL POSTS ===================== */

export const getAllPosts = catchAsync(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
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
    success: true,
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

/* ===================== GET POST BY ID ===================== */

export const getPostById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await postModel
    .findById(id)
    .populate("user", "username profilepic")
    .populate("comments.user", "username profilepic");

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  res.status(200).json({
    success: true,
    post,
  });
});

/* ===================== DELETE POST ===================== */

export const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await postModel.findById(id);
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You can only delete your own posts", 403)
    );
  }

  await postModel.findByIdAndDelete(id);

  const io = req.app.get("io");
  if (io) {
    io.emit("postDeleted", id);
  }

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

/* ===================== TOGGLE LIKE ===================== */

export const toggleLike = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await postModel.findById(postId);
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const liked = post.likes.includes(userId);

  if (liked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("postLiked", {
      postId: post._id,
      likes: post.likes,
    });
  }

  res.status(200).json({
    success: true,
    message: liked ? "Post unliked" : "Post liked",
    likes: post.likes,
  });
});
