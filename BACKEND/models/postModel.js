import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  content: {
    type: String,
    required: [true, "Post content is required"],
    trim: true,
    minlength: [1, "Post content cannot be empty"],
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
}, {
  timestamps: true,
});

export default mongoose.model("Post", postSchema);
