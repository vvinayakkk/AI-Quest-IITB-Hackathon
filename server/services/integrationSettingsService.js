import { logger } from "../utils/logger.js";
import { Integration } from "../models/index.js";

// Get integration settings
export const getIntegrationSettings = async (userId) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      type: "settings",
    });

    if (!integration) {
      // Create default settings if not exists
      return await createDefaultSettings(userId);
    }

    return integration.settings;
  } catch (error) {
    logger.error("Error getting integration settings:", error);
    throw error;
  }
};

// Update integration settings
export const updateIntegrationSettings = async (userId, settings) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      type: "settings",
    });

    if (!integration) {
      // Create new settings
      const newIntegration = new Integration({
        user: userId,
        type: "settings",
        status: "active",
        settings,
      });

      await newIntegration.save();
      logger.info(`Integration settings created for user ${userId}`);
      return settings;
    }

    // Update existing settings
    integration.settings = {
      ...integration.settings,
      ...settings,
    };

    await integration.save();
    logger.info(`Integration settings updated for user ${userId}`);

    return integration.settings;
  } catch (error) {
    logger.error("Error updating integration settings:", error);
    throw error;
  }
};

// Create default settings
const createDefaultSettings = async (userId) => {
  try {
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        webhook: false,
      },
      privacy: {
        showEmail: false,
        showActivity: true,
        showReputation: true,
      },
      integrations: {
        github: {
          enabled: false,
          autoSync: false,
          syncInterval: "daily",
        },
        google: {
          enabled: false,
          autoSync: false,
          syncInterval: "daily",
        },
      },
      webhooks: {
        enabled: false,
        maxRetries: 3,
        retryInterval: 300, // 5 minutes
      },
      apiKeys: {
        maxKeys: 5,
        keyExpiry: 30, // 30 days
        requireExpiry: true,
      },
    };

    const integration = new Integration({
      user: userId,
      type: "settings",
      status: "active",
      settings: defaultSettings,
    });

    await integration.save();
    logger.info(`Default integration settings created for user ${userId}`);

    return defaultSettings;
  } catch (error) {
    logger.error("Error creating default settings:", error);
    throw error;
  }
};

// Reset integration settings
export const resetIntegrationSettings = async (userId) => {
  try {
    await Integration.deleteOne({
      user: userId,
      type: "settings",
    });

    const defaultSettings = await createDefaultSettings(userId);
    logger.info(`Integration settings reset for user ${userId}`);

    return defaultSettings;
  } catch (error) {
    logger.error("Error resetting integration settings:", error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings = async (userId) => {
  try {
    const settings = await getIntegrationSettings(userId);
    return settings.notifications;
  } catch (error) {
    logger.error("Error getting notification settings:", error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (userId, notificationSettings) => {
  try {
    const settings = await getIntegrationSettings(userId);
    settings.notifications = {
      ...settings.notifications,
      ...notificationSettings,
    };

    await updateIntegrationSettings(userId, settings);
    return settings.notifications;
  } catch (error) {
    logger.error("Error updating notification settings:", error);
    throw error;
  }
};

// Get privacy settings
export const getPrivacySettings = async (userId) => {
  try {
    const settings = await getIntegrationSettings(userId);
    return settings.privacy;
  } catch (error) {
    logger.error("Error getting privacy settings:", error);
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (userId, privacySettings) => {
  try {
    const settings = await getIntegrationSettings(userId);
    settings.privacy = {
      ...settings.privacy,
      ...privacySettings,
    };

    await updateIntegrationSettings(userId, settings);
    return settings.privacy;
  } catch (error) {
    logger.error("Error updating privacy settings:", error);
    throw error;
  }
};

// Get integration-specific settings
export const getIntegrationSpecificSettings = async (userId, integrationType) => {
  try {
    const settings = await getIntegrationSettings(userId);
    return settings.integrations[integrationType];
  } catch (error) {
    logger.error("Error getting integration-specific settings:", error);
    throw error;
  }
};

// Update integration-specific settings
export const updateIntegrationSpecificSettings = async (userId, integrationType, integrationSettings) => {
  try {
    const settings = await getIntegrationSettings(userId);
    settings.integrations[integrationType] = {
      ...settings.integrations[integrationType],
      ...integrationSettings,
    };

    await updateIntegrationSettings(userId, settings);
    return settings.integrations[integrationType];
  } catch (error) {
    logger.error("Error updating integration-specific settings:", error);
    throw error;
  }
}; 