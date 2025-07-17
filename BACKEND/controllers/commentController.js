import commentModel from "../models/commentModel.js";

export const addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    // Validation
    if (!postId || !text || !text.trim()) {
      return res
        .status(400)
        .json({ message: "Post ID and comment text are required" });
    }

    const comment = await commentModel.create({
      postId,
      userId: req.user._id,
      text: text.trim(),
    });

    // Populate user data before sending response
    await comment.populate("userId", "username profilepic");

    const io = req.app.get("io");
    io.emit("newComment", {
      postId,
      comment: {
        ...comment,
        username: req.user.username,
      },
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await commentModel
      .find({ postId: req.params.postId })
      .populate("userId", "username profilepic")
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Failed to get comments" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await commentModel.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    await commentModel.findByIdAndDelete(req.params.commentId);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
