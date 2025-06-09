import mongoose from "mongoose";

const communityGuidelinesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "general",
        "content",
        "behavior",
        "privacy",
        "moderation",
        "other",
      ],
      default: "general",
    },
    priority: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
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
communityGuidelinesSchema.index({ category: 1 });
communityGuidelinesSchema.index({ status: 1 });
communityGuidelinesSchema.index({ priority: 1 });
communityGuidelinesSchema.index({ publishedAt: -1 });

// Methods
communityGuidelinesSchema.methods.publish = async function(userId) {
  this.status = "published";
  this.publishedAt = new Date();
  this.publishedBy = userId;
  this.lastUpdatedBy = userId;
  await this.save();
};

communityGuidelinesSchema.methods.archive = async function(userId) {
  this.status = "archived";
  this.lastUpdatedBy = userId;
  await this.save();
};

communityGuidelinesSchema.methods.updateVersion = async function(userId) {
  this.version += 1;
  this.lastUpdatedBy = userId;
  await this.save();
};

// Static methods
communityGuidelinesSchema.statics.findPublished = function() {
  return this.find({
    status: "published",
  }).sort({ priority: -1, publishedAt: -1 });
};

communityGuidelinesSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    status: "published",
  }).sort({ priority: -1, publishedAt: -1 });
};

const CommunityGuidelines = mongoose.model("CommunityGuidelines", communityGuidelinesSchema);

export default CommunityGuidelines; 