import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Comment content is required"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["user", "correct", "ai"],
    default: "user",
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  flagged: {
    type: {
      status: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        trim: true,
      },
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
