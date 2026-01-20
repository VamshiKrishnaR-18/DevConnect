import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  content: {
    type: String,
    trim: true,
    // validation removed: content is no longer mandatory (handled by controller)
    maxlength: [1000, "Post content cannot exceed 1000 characters"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  media: [{
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    filename: String,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
}, {
  timestamps: true,
});

export default mongoose.model("Post", postSchema);