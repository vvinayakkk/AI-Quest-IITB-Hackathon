import express from "express";
import {
  sendMessage,
  getConversation,
  getUnreadMessages,
  getSentMessages,
  getReceivedMessages,
  markAsRead,
  markAsUnread,
  deleteMessage,
} from "../controllers/messageController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import {
  sendMessageSchema,
} from "../validation/messageValidation.js";

const router = express.Router();

// Send message
router.post(
  "/",
  authenticate,
  validate(sendMessageSchema),
  sendMessage
);

// Get conversation with user
router.get(
  "/conversation/:userId",
  authenticate,
  getConversation
);

// Get unread messages
router.get(
  "/unread",
  authenticate,
  getUnreadMessages
);

// Get sent messages
router.get(
  "/sent",
  authenticate,
  getSentMessages
);

// Get received messages
router.get(
  "/received",
  authenticate,
  getReceivedMessages
);

// Mark message as read
router.put(
  "/:id/read",
  authenticate,
  markAsRead
);

// Mark message as unread
router.put(
  "/:id/unread",
  authenticate,
  markAsUnread
);

// Delete message
router.delete(
  "/:id",
  authenticate,
  deleteMessage
);

export default router; 