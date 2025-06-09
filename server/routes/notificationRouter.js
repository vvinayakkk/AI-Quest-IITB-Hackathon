import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendMessage,
  getMessages,
  getConversation,
  markMessageRead,
  deleteMessage,
  getUnreadMessagesCount
} from "../controllers/notificationController.js";
import { validate } from "../middleware/validation.js";
import { notificationValidation } from "../middleware/validation.js";
import { verifyToken } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { cacheMiddleware } from "../services/cacheService.js";

const notificationRouter = express.Router();

// Notification routes
notificationRouter.get("/", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getNotifications
);

notificationRouter.get("/unread/count", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getUnreadCount
);

notificationRouter.post("/:id/read", 
  verifyToken, 
  apiLimiter, 
  markNotificationRead
);

notificationRouter.post("/read/all", 
  verifyToken, 
  apiLimiter, 
  markAllNotificationsRead
);

notificationRouter.delete("/:id", 
  verifyToken, 
  apiLimiter, 
  deleteNotification
);

notificationRouter.get("/preferences", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getNotificationPreferences
);

notificationRouter.put("/preferences", 
  verifyToken, 
  apiLimiter, 
  validate(notificationValidation.updatePreferences), 
  updateNotificationPreferences
);

// Messaging routes
notificationRouter.post("/messages", 
  verifyToken, 
  apiLimiter, 
  validate(notificationValidation.sendMessage), 
  sendMessage
);

notificationRouter.get("/messages", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getMessages
);

notificationRouter.get("/messages/:userId", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getConversation
);

notificationRouter.post("/messages/:id/read", 
  verifyToken, 
  apiLimiter, 
  markMessageRead
);

notificationRouter.delete("/messages/:id", 
  verifyToken, 
  apiLimiter, 
  deleteMessage
);

notificationRouter.get("/messages/unread/count", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getUnreadMessagesCount
);

export default notificationRouter; 