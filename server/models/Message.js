import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 5000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "link"],
      default: "text",
    },
    attachments: [{
      type: {
        type: String,
        enum: ["image", "file", "link"],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        trim: true,
      },
      size: {
        type: Number,
      },
      mimeType: {
        type: String,
      },
    }],
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
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
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ read: 1 });
messageSchema.index({ deleted: 1 });
messageSchema.index({ createdAt: -1 });

// Methods
messageSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
};

messageSchema.methods.markAsUnread = async function() {
  if (this.read) {
    this.read = false;
    this.readAt = undefined;
    await this.save();
  }
};

messageSchema.methods.softDelete = async function() {
  if (!this.deleted) {
    this.deleted = true;
    this.deletedAt = new Date();
    await this.save();
  }
};

// Static methods
messageSchema.statics.findConversation = function(user1Id, user2Id) {
  return this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id },
    ],
    deleted: false,
  }).sort({ createdAt: 1 });
};

messageSchema.statics.findUnread = function(userId) {
  return this.find({
    recipient: userId,
    read: false,
    deleted: false,
  }).sort({ createdAt: -1 });
};

messageSchema.statics.findSent = function(userId) {
  return this.find({
    sender: userId,
    deleted: false,
  }).sort({ createdAt: -1 });
};

messageSchema.statics.findReceived = function(userId) {
  return this.find({
    recipient: userId,
    deleted: false,
  }).sort({ createdAt: -1 });
};

const Message = mongoose.model("Message", messageSchema);

export default Message; 