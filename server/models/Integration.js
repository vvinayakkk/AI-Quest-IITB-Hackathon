import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["github", "google", "facebook", "twitter"],
    },
    type: {
      type: String,
      required: true,
      enum: ["auth", "code", "settings"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    clientId: String,
    clientSecret: String,
    redirectUri: String,
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
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
integrationSchema.index({ user: 1, provider: 1, type: 1 }, { unique: true });
integrationSchema.index({ status: 1 });
integrationSchema.index({ expiresAt: 1 });

// Methods
integrationSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

integrationSchema.methods.refreshAccessToken = async function () {
  if (!this.refreshToken) {
    throw new Error("No refresh token available");
  }

  // Implement provider-specific token refresh logic
  switch (this.provider) {
    case "github":
      // Implement GitHub token refresh
      break;
    case "google":
      // Implement Google token refresh
      break;
    default:
      throw new Error(`Token refresh not implemented for ${this.provider}`);
  }
};

const Integration = mongoose.model("Integration", integrationSchema);

export default Integration; 