import crypto from "crypto";
import { logger } from "../utils/logger.js";
import { ApiKey } from "../models/index.js";

// Generate API key
export const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Create API key
export const createApiKey = async (userId, name, permissions, expiresAt = null) => {
  try {
    const key = generateApiKey();
    const apiKey = new ApiKey({
      user: userId,
      name,
      key,
      permissions,
      expiresAt,
    });

    await apiKey.save();
    logger.info(`API key created for user ${userId}`);

    // Return the unhashed key only once
    return {
      ...apiKey.toObject(),
      key,
    };
  } catch (error) {
    logger.error("Error creating API key:", error);
    throw error;
  }
};

// Get API keys
export const getApiKeys = async (userId) => {
  try {
    const apiKeys = await ApiKey.find({ user: userId })
      .select("-key") // Exclude the actual key
      .sort({ createdAt: -1 });

    return apiKeys;
  } catch (error) {
    logger.error("Error getting API keys:", error);
    throw error;
  }
};

// Update API key
export const updateApiKey = async (userId, apiKeyId, updates) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: apiKeyId,
      user: userId,
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }

    // Update allowed fields
    if (updates.name) apiKey.name = updates.name;
    if (updates.permissions) apiKey.permissions = updates.permissions;
    if (updates.status) apiKey.status = updates.status;
    if (updates.expiresAt) apiKey.expiresAt = updates.expiresAt;

    await apiKey.save();
    logger.info(`API key ${apiKeyId} updated for user ${userId}`);

    return apiKey;
  } catch (error) {
    logger.error("Error updating API key:", error);
    throw error;
  }
};

// Delete API key
export const deleteApiKey = async (userId, apiKeyId) => {
  try {
    const result = await ApiKey.deleteOne({
      _id: apiKeyId,
      user: userId,
    });

    if (result.deletedCount === 0) {
      throw new Error("API key not found");
    }

    logger.info(`API key ${apiKeyId} deleted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error deleting API key:", error);
    throw error;
  }
};

// Regenerate API key
export const regenerateApiKey = async (userId, apiKeyId) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: apiKeyId,
      user: userId,
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }

    const newKey = generateApiKey();
    apiKey.key = newKey;
    apiKey.lastUsed = null;
    await apiKey.save();

    logger.info(`API key ${apiKeyId} regenerated for user ${userId}`);

    // Return the new unhashed key only once
    return {
      ...apiKey.toObject(),
      key: newKey,
    };
  } catch (error) {
    logger.error("Error regenerating API key:", error);
    throw error;
  }
};

// Verify API key
export const verifyApiKey = async (key) => {
  try {
    const apiKey = await ApiKey.findOne({ key });

    if (!apiKey) {
      return null;
    }

    if (apiKey.status !== "active") {
      return null;
    }

    if (apiKey.isExpired()) {
      apiKey.status = "expired";
      await apiKey.save();
      return null;
    }

    // Update last used timestamp
    await apiKey.updateLastUsed();

    return apiKey;
  } catch (error) {
    logger.error("Error verifying API key:", error);
    throw error;
  }
};

// Check API key permissions
export const checkApiKeyPermissions = (apiKey, requiredPermissions) => {
  if (!apiKey) {
    return false;
  }

  if (Array.isArray(requiredPermissions)) {
    return apiKey.hasAllPermissions(requiredPermissions);
  }

  return apiKey.hasPermission(requiredPermissions);
};

// Clean up expired API keys
export const cleanupExpiredApiKeys = async () => {
  try {
    const result = await ApiKey.updateMany(
      {
        status: "active",
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: "expired" },
      }
    );

    logger.info(`Marked ${result.modifiedCount} API keys as expired`);
  } catch (error) {
    logger.error("Error cleaning up expired API keys:", error);
    throw error;
  }
}; 