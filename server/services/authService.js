import { OAuth2Client } from "google-auth-library";
import { logger } from "../utils/logger.js";
import { Integration, User } from "../models/index.js";

// Initialize OAuth2 clients
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Get Google authentication URL
export const getGoogleAuthUrl = () => {
  return googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
};

// Verify Google token
export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error) {
    logger.error("Error verifying Google token:", error);
    throw error;
  }
};

// Exchange Google code for tokens
export const exchangeGoogleCode = async (code) => {
  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const { data } = await googleClient.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    return {
      tokens,
      userInfo: data,
    };
  } catch (error) {
    logger.error("Error exchanging Google code:", error);
    throw error;
  }
};

// Get auth providers
export const getAuthProviders = async (userId) => {
  try {
    const providers = await Integration.find({
      user: userId,
      type: "oauth",
    }).select("provider status createdAt");

    return providers;
  } catch (error) {
    logger.error("Error getting auth providers:", error);
    throw error;
  }
};

// Configure auth provider
export const configureAuthProvider = async (userId, provider, tokens, userInfo) => {
  try {
    // Check if provider already exists
    let integration = await Integration.findOne({
      user: userId,
      provider,
      type: "oauth",
    });

    if (integration) {
      // Update existing integration
      integration.accessToken = tokens.access_token;
      integration.refreshToken = tokens.refresh_token;
      integration.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
      integration.status = "active";
      integration.metadata = {
        ...integration.metadata,
        userInfo,
      };
    } else {
      // Create new integration
      integration = new Integration({
        user: userId,
        provider,
        type: "oauth",
        status: "active",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        metadata: {
          userInfo,
        },
      });
    }

    await integration.save();
    logger.info(`Auth provider ${provider} configured for user ${userId}`);

    return integration;
  } catch (error) {
    logger.error("Error configuring auth provider:", error);
    throw error;
  }
};

// Remove auth provider
export const removeAuthProvider = async (userId, provider) => {
  try {
    const result = await Integration.deleteOne({
      user: userId,
      provider,
      type: "oauth",
    });

    if (result.deletedCount === 0) {
      throw new Error("Auth provider not found");
    }

    logger.info(`Auth provider ${provider} removed for user ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error removing auth provider:", error);
    throw error;
  }
};

// Refresh auth token
export const refreshAuthToken = async (userId, provider) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider,
      type: "oauth",
    });

    if (!integration) {
      throw new Error("Auth provider not found");
    }

    let tokens;

    switch (provider) {
      case "google":
        googleClient.setCredentials({
          refresh_token: integration.refreshToken,
        });
        const { credentials } = await googleClient.refreshAccessToken();
        tokens = credentials;
        break;
      default:
        throw new Error("Unsupported auth provider");
    }

    // Update integration with new tokens
    integration.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      integration.refreshToken = tokens.refresh_token;
    }
    integration.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await integration.save();

    return tokens;
  } catch (error) {
    logger.error("Error refreshing auth token:", error);
    throw error;
  }
};

// Link external account
export const linkExternalAccount = async (userId, provider, userInfo) => {
  try {
    // Check if user exists with this email
    const existingUser = await User.findOne({ email: userInfo.email });

    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error("Email already associated with another account");
    }

    // Update user profile with external account info
    await User.findByIdAndUpdate(userId, {
      $set: {
        [`externalAccounts.${provider}`]: {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      },
    });

    logger.info(`External account ${provider} linked for user ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error linking external account:", error);
    throw error;
  }
};

// Unlink external account
export const unlinkExternalAccount = async (userId, provider) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $unset: { [`externalAccounts.${provider}`]: 1 },
    });

    logger.info(`External account ${provider} unlinked for user ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error unlinking external account:", error);
    throw error;
  }
}; 