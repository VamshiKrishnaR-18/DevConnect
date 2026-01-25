import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  content: {
    type: String,
    trim: true,
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
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: String,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  
  // FIX: Change this from 'ObjectId' to an Object Structure
  comments: [
    {
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      },
      text: { 
        type: String, 
        required: true, 
        trim: true 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      },
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.model("Post", postSchema);