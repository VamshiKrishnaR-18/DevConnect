import postModel from "../models/Post.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "./notification.service.js"; // <--- 1. THIS WAS MISSING



//CREATE POST (TEXT ONLY)
export const createPost = async ({ userId, content }) => {
  if (!content || !content.trim()) {
    throw new AppError("Post content is required", 400, "POST_CONTENT_REQUIRED");
  }

  const post = await postModel.create({
    content: content.trim(),
    user: userId,
  });

  await post.populate("user", "username profilepic");
  return post;
};


//CREATE POST (WITH MEDIA)
export const createPostWithMedia = async ({ userId, content, files }) => {
  if ((!content || !content.trim()) && (!files || files.length === 0)) {
    throw new AppError("Post must have content or media", 400, "POST_EMPTY");
  }

  const media = files.map((file) => ({
   
    url: `/uploads/${file.filename}`, 
    publicId: file.filename,
    type: file.mimetype.startsWith("video") ? "video" : "image",
  }));

  const post = await postModel.create({
    content: content ? content.trim() : "",
    user: userId,
    media: media,
  });

  await post.populate("user", "username profilepic");
  return post;
};



// DELETE POST
export const deletePostService = async ({ postId, userId }) => {
  const post = await postModel.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404, "POST_NOT_FOUND");
  }

  if (post.user.toString() !== userId.toString()) {
    throw new AppError("Not authorized to delete this post", 403, "FORBIDDEN");
  }

  await postModel.findByIdAndDelete(postId);
  
  return { postId };
};

//LIKE / UNLIKE POST

export const toggleLikeService = async ({ postId, userId, io }) => {
  const post = await postModel.findById(postId);

  if (!post) {
    throw new AppError("Post not found", 404, "POST_NOT_FOUND");
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    
    post.likes.push(userId);

    
    if (post.user.toString() !== userId.toString()) {
      await createNotification({
        recipient: post.user,
        sender: userId,
        type: "LIKE",
        message: "liked your post",
        link: `/post/${postId}`,
        io: io
      });
    }
  }

  await post.save();
  return { postId, likes: post.likes, liked: !isLiked };
};



//ADD COMMENT

export const addCommentService = async ({ postId, userId, text, io }) => {
  const post = await postModel.findById(postId);


  const newComment = {
    user: userId,
    text: text,
    createdAt: new Date(),
  };

  post.comments.push(newComment);
  await post.save();


  if (post.user.toString() !== userId.toString()) {
    await createNotification({
      recipient: post.user,
      sender: userId,
      type: "COMMENT",
      message: `commented: "${text.substring(0, 20)}..."`,
      link: `/post/${postId}`,
      io: io
    });
  }

  await post.populate("comments.user", "username profilepic");
  return post.comments;
};