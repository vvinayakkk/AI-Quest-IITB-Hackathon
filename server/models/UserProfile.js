import mongoose from "mongoose";
import { User } from "./index.js";

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: process.env.MAX_BIO_LENGTH || 500,
    trim: true
  },
  location: {
    type: String,
    maxlength: process.env.MAX_LOCATION_LENGTH || 100,
    trim: true
  },
  website: {
    type: String,
    maxlength: process.env.MAX_WEBSITE_LENGTH || 200,
    trim: true
  },
  avatar: {
    type: String,
    default: process.env.DEFAULT_AVATAR_URL
  },
  socialLinks: [{
    platform: {
      type: String,
      enum: ["github", "twitter", "linkedin", "facebook", "instagram"],
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  preferences: {
    language: {
      type: String,
      default: process.env.DEFAULT_CONTENT_LANGUAGE || "en"
    },
    timezone: {
      type: String,
      default: process.env.DEFAULT_CONTENT_TIMEZONE || "UTC"
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system"
    },
    emailNotifications: {
      type: Boolean,
      default: process.env.DEFAULT_EMAIL_NOTIFICATIONS === "true"
    },
    pushNotifications: {
      type: Boolean,
      default: process.env.DEFAULT_PUSH_NOTIFICATIONS === "true"
    },
    mentionNotifications: {
      type: Boolean,
      default: process.env.DEFAULT_MENTION_NOTIFICATIONS === "true"
    },
    commentNotifications: {
      type: Boolean,
      default: process.env.DEFAULT_COMMENT_NOTIFICATIONS === "true"
    },
    followNotifications: {
      type: Boolean,
      default: process.env.DEFAULT_FOLLOW_NOTIFICATIONS === "true"
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ["public", "private", "connections"],
      default: process.env.DEFAULT_PRIVACY_LEVEL || "public"
    },
    activityVisibility: {
      type: String,
      enum: ["public", "private", "connections"],
      default: process.env.DEFAULT_PRIVACY_LEVEL || "public"
    },
    emailVisibility: {
      type: String,
      enum: ["public", "private", "connections"],
      default: process.env.DEFAULT_PRIVACY_LEVEL || "public"
    }
  },
  reputation: {
    score: {
      type: Number,
      default: process.env.INITIAL_REPUTATION || 0
    },
    history: [{
      action: {
        type: String,
        required: true
      },
      points: {
        type: Number,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  savedItems: [{
    type: {
      type: String,
      enum: ["post", "comment"],
      required: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "savedItems.type",
      required: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  activityHistory: [{
    action: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userProfileSchema.index({ user: 1 });
userProfileSchema.index({ "socialLinks.platform": 1 });
userProfileSchema.index({ "preferences.language": 1 });
userProfileSchema.index({ "preferences.timezone": 1 });
userProfileSchema.index({ reputation: -1 });
userProfileSchema.index({ lastActive: -1 });

// Methods
userProfileSchema.methods.updateLastActive = async function() {
  this.lastActive = new Date();
  await this.save();
};

userProfileSchema.methods.addReputation = async function(points, action) {
  this.reputation.score += points;
  this.reputation.history.push({
    action,
    points,
    timestamp: new Date()
  });
  await this.save();
};

userProfileSchema.methods.follow = async function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    await this.save();
    
    // Add to target user's followers
    const targetProfile = await UserProfile.findOne({ user: userId });
    if (targetProfile) {
      targetProfile.followers.push(this.user);
      await targetProfile.save();
    }
  }
};

userProfileSchema.methods.unfollow = async function(userId) {
  this.following = this.following.filter(id => id.toString() !== userId.toString());
  await this.save();
  
  // Remove from target user's followers
  const targetProfile = await UserProfile.findOne({ user: userId });
  if (targetProfile) {
    targetProfile.followers = targetProfile.followers.filter(id => id.toString() !== this.user.toString());
    await targetProfile.save();
  }
};

userProfileSchema.methods.saveItem = async function(type, itemId) {
  if (!this.savedItems.some(item => item.type === type && item.item.toString() === itemId.toString())) {
    this.savedItems.push({
      type,
      item: itemId,
      savedAt: new Date()
    });
    await this.save();
  }
};

userProfileSchema.methods.unsaveItem = async function(type, itemId) {
  this.savedItems = this.savedItems.filter(
    item => !(item.type === type && item.item.toString() === itemId.toString())
  );
  await this.save();
};

userProfileSchema.methods.addActivity = async function(action, details = {}) {
  this.activityHistory.push({
    action,
    details,
    timestamp: new Date()
  });
  
  // Keep only the last MAX_ACTIVITY_ITEMS activities
  if (this.activityHistory.length > (process.env.MAX_ACTIVITY_ITEMS || 1000)) {
    this.activityHistory = this.activityHistory.slice(-(process.env.MAX_ACTIVITY_ITEMS || 1000));
  }
  
  await this.save();
};

// Static methods
userProfileSchema.statics.findByUsername = async function(username) {
  const user = await User.findOne({ username });
  if (!user) return null;
  return this.findOne({ user: user._id });
};

userProfileSchema.statics.getTopUsers = async function(limit = 10) {
  return this.find()
    .sort({ "reputation.score": -1 })
    .limit(limit)
    .populate("user", "username email");
};

// Pre-save middleware
userProfileSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Post-save middleware
userProfileSchema.post("save", async function() {
  // Clear user cache
  await clearCacheByPattern(`users:${this.user}:*`);
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

export default UserProfile; 