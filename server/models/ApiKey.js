import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
    },
    permissions: [{
      type: String,
      enum: [
        "read:posts",
        "write:posts",
        "read:comments",
        "write:comments",
        "read:users",
        "write:users",
        "read:categories",
        "write:categories",
        "read:tags",
        "write:tags",
      ],
    }],
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    lastUsed: Date,
    expiresAt: Date,
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
apiKeySchema.index({ user: 1 });
apiKeySchema.index({ key: 1 }, { unique: true });
apiKeySchema.index({ status: 1 });
apiKeySchema.index({ expiresAt: 1 });

// Methods
apiKeySchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

apiKeySchema.methods.updateLastUsed = async function () {
  this.lastUsed = new Date();
  await this.save();
};

apiKeySchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

apiKeySchema.methods.hasAllPermissions = function (permissions) {
  return permissions.every(permission => this.permissions.includes(permission));
};

apiKeySchema.methods.hasAnyPermission = function (permissions) {
  return permissions.some(permission => this.permissions.includes(permission));
};

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

export default ApiKey; 