import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    events: [{
      type: String,
      required: true,
      enum: [
        "post.created",
        "post.updated",
        "post.deleted",
        "comment.created",
        "comment.updated",
        "comment.deleted",
        "user.created",
        "user.updated",
        "user.deleted",
      ],
    }],
    secret: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
    lastTriggered: Date,
    failureCount: {
      type: Number,
      default: 0,
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
webhookSchema.index({ user: 1 });
webhookSchema.index({ status: 1 });
webhookSchema.index({ events: 1 });

// Methods
webhookSchema.methods.incrementFailureCount = async function () {
  this.failureCount += 1;
  if (this.failureCount >= 5) {
    this.status = "error";
  }
  await this.save();
};

webhookSchema.methods.resetFailureCount = async function () {
  this.failureCount = 0;
  this.status = "active";
  await this.save();
};

webhookSchema.methods.updateLastTriggered = async function () {
  this.lastTriggered = new Date();
  await this.save();
};

const Webhook = mongoose.model("Webhook", webhookSchema);

export default Webhook; 