import crypto from "crypto";
import fetch from "node-fetch";
import { logger } from "../utils/logger.js";
import { Webhook } from "../models/index.js";

// Send webhook event to registered endpoints
export const sendWebhookEvent = async (webhook, event) => {
  try {
    if (webhook.status !== "active") {
      return;
    }

    // Check if webhook is subscribed to this event type
    if (!webhook.events.includes(event.type)) {
      return;
    }

    // Generate signature
    const signature = generateWebhookSignature(webhook.secret, event);

    // Send webhook
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event.type,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      await webhook.incrementFailureCount();
      throw new Error(`Webhook delivery failed: ${response.statusText}`);
    }

    // Update webhook status
    await webhook.resetFailureCount();
    await webhook.updateLastTriggered();

    logger.info(`Webhook event ${event.type} sent successfully to ${webhook.url}`);
  } catch (error) {
    logger.error("Error sending webhook event:", error);
    throw error;
  }
};

// Generate webhook signature
export const generateWebhookSignature = (secret, payload) => {
  const hmac = crypto.createHmac("sha256", secret);
  return hmac.update(JSON.stringify(payload)).digest("hex");
};

// Verify webhook signature
export const verifyWebhookSignature = (secret, payload, signature) => {
  const calculatedSignature = generateWebhookSignature(secret, payload);
  return calculatedSignature === signature;
};

// Process webhook events
export const processWebhookEvent = async (event) => {
  try {
    // Find all active webhooks subscribed to this event type
    const webhooks = await Webhook.find({
      status: "active",
      events: event.type,
    });

    // Send event to all matching webhooks
    await Promise.all(
      webhooks.map(webhook => sendWebhookEvent(webhook, event))
    );
  } catch (error) {
    logger.error("Error processing webhook event:", error);
    throw error;
  }
};

// Retry failed webhooks
export const retryFailedWebhooks = async () => {
  try {
    const failedWebhooks = await Webhook.find({
      status: "error",
      failureCount: { $lt: 5 },
    });

    for (const webhook of failedWebhooks) {
      try {
        // Reset failure count and status
        await webhook.resetFailureCount();
        logger.info(`Reset webhook status for ${webhook.url}`);
      } catch (error) {
        logger.error(`Error resetting webhook ${webhook.url}:`, error);
      }
    }
  } catch (error) {
    logger.error("Error retrying failed webhooks:", error);
    throw error;
  }
};

// Clean up expired webhooks
export const cleanupExpiredWebhooks = async () => {
  try {
    const result = await Webhook.deleteMany({
      status: "error",
      failureCount: { $gte: 5 },
      updatedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days
    });

    logger.info(`Cleaned up ${result.deletedCount} expired webhooks`);
  } catch (error) {
    logger.error("Error cleaning up expired webhooks:", error);
    throw error;
  }
}; 