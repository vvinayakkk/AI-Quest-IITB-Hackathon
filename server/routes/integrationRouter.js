import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { cache } from "../middleware/cache.js";
import { validate } from "../middleware/validation.js";
import * as integrationController from "../controllers/integrationController.js";
import {
  createGithubGistSchema,
  updateGithubGistSchema,
  configureAuthProviderSchema,
  createWebhookSchema,
  updateWebhookSchema,
  createApiKeySchema,
  updateApiKeySchema,
  updateIntegrationSettingsSchema,
} from "../middleware/validation.js";

const router = express.Router();

// Apply middleware to all routes
router.use(verifyToken);
router.use(rateLimit);

// GitHub Integration Routes
router.get("/github/auth", integrationController.getGithubAuth);
router.get("/github/callback", integrationController.handleGithubCallback);
router.get("/github/repos", cache(300), integrationController.getGithubRepos); // Cache for 5 minutes
router.get("/github/gists", cache(300), integrationController.getGithubGists); // Cache for 5 minutes
router.post("/github/gists", validate(createGithubGistSchema), integrationController.createGithubGist);
router.put("/github/gists/:gistId", validate(updateGithubGistSchema), integrationController.updateGithubGist);
router.delete("/github/gists/:gistId", integrationController.deleteGithubGist);

// External Auth Provider Routes
router.get("/auth/providers", cache(300), integrationController.getAuthProviders); // Cache for 5 minutes
router.post("/auth/providers/:provider", validate(configureAuthProviderSchema), integrationController.configureAuthProvider);
router.delete("/auth/providers/:provider", integrationController.removeAuthProvider);

// Webhook Routes
router.get("/webhooks", cache(300), integrationController.getWebhooks); // Cache for 5 minutes
router.post("/webhooks", validate(createWebhookSchema), integrationController.createWebhook);
router.put("/webhooks/:webhookId", validate(updateWebhookSchema), integrationController.updateWebhook);
router.delete("/webhooks/:webhookId", integrationController.deleteWebhook);
router.post("/webhooks/:webhookId/events", integrationController.handleWebhookEvent);

// API Key Routes
router.get("/api-keys", cache(300), integrationController.getApiKeys); // Cache for 5 minutes
router.post("/api-keys", validate(createApiKeySchema), integrationController.createApiKey);
router.put("/api-keys/:apiKeyId", validate(updateApiKeySchema), integrationController.updateApiKey);
router.delete("/api-keys/:apiKeyId", integrationController.deleteApiKey);
router.post("/api-keys/:apiKeyId/regenerate", integrationController.regenerateApiKey);

// Integration Settings Routes
router.get("/settings", cache(300), integrationController.getIntegrationSettings); // Cache for 5 minutes
router.put("/settings", validate(updateIntegrationSettingsSchema), integrationController.updateIntegrationSettings);
router.post("/settings/reset", integrationController.resetIntegrationSettings);

export default router; 