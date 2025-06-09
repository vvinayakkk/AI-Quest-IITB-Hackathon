import { Octokit } from "@octokit/rest";
import { OAuth2Client } from "google-auth-library";
import { Integration, Webhook, ApiKey, User } from "../models/index.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { generateApiKey, hashApiKey } from "../utils/apiKey.js";
import { sendWebhookEvent } from "../services/webhookService.js";
import { clearCacheByPattern } from "../services/cacheService.js";
import * as githubService from "../services/githubService.js";
import * as authService from "../services/authService.js";
import * as webhookService from "../services/webhookService.js";
import * as apiKeyService from "../services/apiKeyService.js";
import * as integrationSettingsService from "../services/integrationSettingsService.js";

// GitHub Integration
export const getGithubAuth = async (req, res) => {
  try {
    const authUrl = githubService.getGithubAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    logger.error("Error getting GitHub auth URL:", error);
    res.status(500).json({ error: "Failed to get GitHub auth URL" });
  }
};

export const handleGithubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens, userInfo } = await githubService.exchangeCodeForToken(code);

    // Configure GitHub integration
    const integration = await authService.configureAuthProvider(
      req.user.id,
      "github",
      tokens,
      userInfo
    );

    // Link external account
    await authService.linkExternalAccount(req.user.id, "github", userInfo);

    res.json({ message: "GitHub integration successful", integration });
  } catch (error) {
    logger.error("Error handling GitHub callback:", error);
    res.status(500).json({ error: "Failed to complete GitHub integration" });
  }
};

export const getGithubRepos = async (req, res) => {
  try {
    const repos = await githubService.getUserRepositories(req.user.id);
    res.json(repos);
  } catch (error) {
    logger.error("Error getting GitHub repositories:", error);
    res.status(500).json({ error: "Failed to get GitHub repositories" });
  }
};

export const getGithubGists = async (req, res) => {
  try {
    const gists = await githubService.getUserGists(req.user.id);
    res.json(gists);
  } catch (error) {
    logger.error("Error getting GitHub gists:", error);
    res.status(500).json({ error: "Failed to get GitHub gists" });
  }
};

export const createGithubGist = async (req, res) => {
  try {
    const { description, files, isPublic } = req.body;
    const gist = await githubService.createGist(
      req.user.id,
      description,
      files,
      isPublic
    );
    res.json(gist);
  } catch (error) {
    logger.error("Error creating GitHub gist:", error);
    res.status(500).json({ error: "Failed to create GitHub gist" });
  }
};

export const updateGithubGist = async (req, res) => {
  try {
    const { gistId } = req.params;
    const { description, files } = req.body;
    const gist = await githubService.updateGist(
      req.user.id,
      gistId,
      description,
      files
    );
    res.json(gist);
  } catch (error) {
    logger.error("Error updating GitHub gist:", error);
    res.status(500).json({ error: "Failed to update GitHub gist" });
  }
};

export const deleteGithubGist = async (req, res) => {
  try {
    const { gistId } = req.params;
    await githubService.deleteGist(req.user.id, gistId);
    res.json({ message: "Gist deleted successfully" });
  } catch (error) {
    logger.error("Error deleting GitHub gist:", error);
    res.status(500).json({ error: "Failed to delete GitHub gist" });
  }
};

// External Auth Providers
export const getAuthProviders = async (req, res) => {
  try {
    const providers = await authService.getAuthProviders(req.user.id);
    res.json(providers);
  } catch (error) {
    logger.error("Error getting auth providers:", error);
    res.status(500).json({ error: "Failed to get auth providers" });
  }
};

export const configureAuthProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    const { tokens, userInfo } = req.body;

    const integration = await authService.configureAuthProvider(
      req.user.id,
      provider,
      tokens,
      userInfo
    );

    // Link external account
    await authService.linkExternalAccount(req.user.id, provider, userInfo);

    res.json({ message: "Auth provider configured successfully", integration });
  } catch (error) {
    logger.error("Error configuring auth provider:", error);
    res.status(500).json({ error: "Failed to configure auth provider" });
  }
};

export const removeAuthProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    await authService.removeAuthProvider(req.user.id, provider);
    await authService.unlinkExternalAccount(req.user.id, provider);
    res.json({ message: "Auth provider removed successfully" });
  } catch (error) {
    logger.error("Error removing auth provider:", error);
    res.status(500).json({ error: "Failed to remove auth provider" });
  }
};

// Webhooks
export const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({ user: req.user.id });
    res.json(webhooks);
  } catch (error) {
    logger.error("Error getting webhooks:", error);
    res.status(500).json({ error: "Failed to get webhooks" });
  }
};

export const createWebhook = async (req, res) => {
  try {
    const { url, events, secret } = req.body;

    const webhook = new Webhook({
      user: req.user.id,
      url,
      events,
      secret,
      status: "active",
    });

    await webhook.save();
    res.json(webhook);
  } catch (error) {
    logger.error("Error creating webhook:", error);
    res.status(500).json({ error: "Failed to create webhook" });
  }
};

export const updateWebhook = async (req, res) => {
  try {
    const { webhookId } = req.params;
    const { url, events, secret, status } = req.body;

    const webhook = await Webhook.findOne({
      _id: webhookId,
      user: req.user.id,
    });

    if (!webhook) {
      throw new NotFoundError("Webhook not found");
    }

    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (secret) webhook.secret = secret;
    if (status) webhook.status = status;

    await webhook.save();
    res.json(webhook);
  } catch (error) {
    logger.error("Error updating webhook:", error);
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to update webhook" });
    }
  }
};

export const deleteWebhook = async (req, res) => {
  try {
    const { webhookId } = req.params;
    const result = await Webhook.deleteOne({
      _id: webhookId,
      user: req.user.id,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError("Webhook not found");
    }

    res.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    logger.error("Error deleting webhook:", error);
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  }
};

export const handleWebhookEvent = async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhook = await Webhook.findById(webhookId);

    if (!webhook) {
      throw new NotFoundError("Webhook not found");
    }

    const signature = req.headers["x-webhook-signature"];
    const isValid = webhookService.verifyWebhookSignature(
      webhook.secret,
      req.body,
      signature
    );

    if (!isValid) {
      throw new ValidationError("Invalid webhook signature");
    }

    await webhookService.processWebhookEvent(req.body);
    res.json({ message: "Webhook event processed successfully" });
  } catch (error) {
    logger.error("Error handling webhook event:", error);
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to process webhook event" });
    }
  }
};

// API Keys
export const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await apiKeyService.getApiKeys(req.user.id);
    res.json(apiKeys);
  } catch (error) {
    logger.error("Error getting API keys:", error);
    res.status(500).json({ error: "Failed to get API keys" });
  }
};

export const createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;
    const apiKey = await apiKeyService.createApiKey(
      req.user.id,
      name,
      permissions,
      expiresAt
    );
    res.json(apiKey);
  } catch (error) {
    logger.error("Error creating API key:", error);
    res.status(500).json({ error: "Failed to create API key" });
  }
};

export const updateApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const updates = req.body;
    const apiKey = await apiKeyService.updateApiKey(req.user.id, apiKeyId, updates);
    res.json(apiKey);
  } catch (error) {
    logger.error("Error updating API key:", error);
    res.status(500).json({ error: "Failed to update API key" });
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    await apiKeyService.deleteApiKey(req.user.id, apiKeyId);
    res.json({ message: "API key deleted successfully" });
  } catch (error) {
    logger.error("Error deleting API key:", error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
};

export const regenerateApiKey = async (req, res) => {
  try {
    const { apiKeyId } = req.params;
    const apiKey = await apiKeyService.regenerateApiKey(req.user.id, apiKeyId);
    res.json(apiKey);
  } catch (error) {
    logger.error("Error regenerating API key:", error);
    res.status(500).json({ error: "Failed to regenerate API key" });
  }
};

// Integration Settings
export const getIntegrationSettings = async (req, res) => {
  try {
    const settings = await integrationSettingsService.getIntegrationSettings(
      req.user.id
    );
    res.json(settings);
  } catch (error) {
    logger.error("Error getting integration settings:", error);
    res.status(500).json({ error: "Failed to get integration settings" });
  }
};

export const updateIntegrationSettings = async (req, res) => {
  try {
    const settings = req.body;
    const updatedSettings = await integrationSettingsService.updateIntegrationSettings(
      req.user.id,
      settings
    );
    res.json(updatedSettings);
  } catch (error) {
    logger.error("Error updating integration settings:", error);
    res.status(500).json({ error: "Failed to update integration settings" });
  }
};

export const resetIntegrationSettings = async (req, res) => {
  try {
    const settings = await integrationSettingsService.resetIntegrationSettings(
      req.user.id
    );
    res.json(settings);
  } catch (error) {
    logger.error("Error resetting integration settings:", error);
    res.status(500).json({ error: "Failed to reset integration settings" });
  }
};

// Helper function to verify webhook signature
const verifyWebhookSignature = (payload, secret, signature) => {
  const hmac = crypto.createHmac("sha256", secret);
  const calculatedSignature = hmac
    .update(JSON.stringify(payload))
    .digest("hex");
  return calculatedSignature === signature;
}; 