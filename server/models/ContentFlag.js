import mongoose from "mongoose";

const contentFlagSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["post", "comment", "user"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "contentType",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "inappropriate",
        "harassment",
        "hate_speech",
        "violence",
        "copyright",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolution: {
      action: {
        type: String,
        enum: [
          "no_action",
          "warning",
          "content_removal",
          "user_suspension",
          "user_ban",
        ],
      },
      notes: {
        type: String,
        trim: true,
        maxLength: 1000,
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: {
        type: Date,
      },
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contentFlagSchema.index({ reporter: 1 });
contentFlagSchema.index({ contentType: 1, contentId: 1 });
contentFlagSchema.index({ status: 1 });
contentFlagSchema.index({ priority: 1 });
contentFlagSchema.index({ assignedTo: 1 });

// Methods
contentFlagSchema.methods.assign = async function(moderatorId) {
  this.assignedTo = moderatorId;
  this.status = "reviewing";
  await this.save();
};

contentFlagSchema.methods.resolve = async function(action, notes, resolvedBy) {
  this.status = "resolved";
  this.resolution = {
    action,
    notes,
    resolvedBy,
    resolvedAt: new Date(),
  };
  await this.save();
};

contentFlagSchema.methods.dismiss = async function(notes, resolvedBy) {
  this.status = "dismissed";
  this.resolution = {
    action: "no_action",
    notes,
    resolvedBy,
    resolvedAt: new Date(),
  };
  await this.save();
};

// Static methods
contentFlagSchema.statics.findByContent = function(contentType, contentId) {
  return this.find({
    contentType,
    contentId,
    status: { $ne: "dismissed" },
  }).sort({ createdAt: -1 });
};

contentFlagSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ priority: -1, createdAt: 1 });
};

contentFlagSchema.statics.findByModerator = function(moderatorId) {
  return this.find({ assignedTo: moderatorId }).sort({ priority: -1, createdAt: 1 });
};

const ContentFlag = mongoose.model("ContentFlag", contentFlagSchema);

export default ContentFlag; 