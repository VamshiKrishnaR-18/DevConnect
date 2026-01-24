import postModel from "../models/Post.model.js";
import AppError from "../utils/AppError.js";

export const createPost = async ({ userId, content }) => {
  if (!content || !content.trim()) {
    throw new AppError(
      "Post content is required",
      400,
      "POST_CONTENT_REQUIRED"
    );
  }

  const post = await postModel.create({
    content: content.trim(),
    user: userId,
  });

  await post.populate("user", "username profilepic");

  return post;
};
