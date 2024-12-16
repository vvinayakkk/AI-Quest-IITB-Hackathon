import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    type: { 
      type: String,
      enum: ["upvote", "comment", "reply", "mention"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  }
);

const usersSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Prevents password from being returned in queries
    },
    role: {
      type: String,
      enum: ["Member", "Admin", "Moderator"],
      default: "Member",
    },
    department: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    reputation: {
      type: Number,
      default: 0,
      min: [0, "Reputation cannot be negative"],
    },
    answers: {
      type: Number,
      default: 0,
      min: [0, "Answers count cannot be negative"],
    },
    badgesCount: {
      gold: {
        type: Number,
        default: 0,
        min: [0, "Gold badges cannot be negative"],
      },
      silver: {
        type: Number,
        default: 0,
        min: [0, "Silver badges cannot be negative"],
      },
      bronze: {
        type: Number,
        default: 0,
        min: [0, "Bronze badges cannot be negative"],
      },
    },
    badges: {
      gold: [
        {
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          progress: {
            type: Number,
            default: 0,
            min: [0, "Progress cannot be negative"],
            max: [100, "Progress cannot exceed 100"],
          },
          earned: {
            type: Boolean,
            default: false,
          },
        },
      ],
      silver: [
        {
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          progress: {
            type: Number,
            default: 0,
            min: [0, "Progress cannot be negative"],
            max: [100, "Progress cannot exceed 100"],
          },
          earned: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    avatar: {
      type: String,
      default: "https://static.vecteezy.com/system/resources/thumbnails/001/840/612/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    notifications: [notificationSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
usersSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Users = mongoose.model("Users", usersSchema);

export default Users;
