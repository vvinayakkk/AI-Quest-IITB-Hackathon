import express from "express";
import {
  getReports,
  handleReport,
  getModerationQueue,
  getModerationStats,
  getModerationLogs,
  banUser,
  unbanUser,
  getBannedUsers,
  getAdminStats,
  getSystemLogs,
  getAuditLogs,
  updateSystemSettings,
  getSystemHealth
} from "../controllers/moderationController.js";
import { validate } from "../middleware/validation.js";
import { moderationValidation } from "../middleware/validation.js";
import { verifyToken, isModerator, isAdmin } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { cacheMiddleware } from "../services/cacheService.js";

const moderationRouter = express.Router();

// Moderator routes
moderationRouter.get("/reports", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  cacheMiddleware, 
  getReports
);

moderationRouter.post("/reports/:id", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  validate(moderationValidation.handleReport), 
  handleReport
);

moderationRouter.get("/queue", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  cacheMiddleware, 
  getModerationQueue
);

moderationRouter.get("/stats", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  cacheMiddleware, 
  getModerationStats
);

moderationRouter.get("/logs", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  cacheMiddleware, 
  getModerationLogs
);

moderationRouter.post("/users/:id/ban", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  validate(moderationValidation.banUser), 
  banUser
);

moderationRouter.post("/users/:id/unban", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  unbanUser
);

moderationRouter.get("/users/banned", 
  verifyToken, 
  isModerator, 
  apiLimiter, 
  cacheMiddleware, 
  getBannedUsers
);

// Admin routes
moderationRouter.get("/admin/stats", 
  verifyToken, 
  isAdmin, 
  apiLimiter, 
  cacheMiddleware, 
  getAdminStats
);

moderationRouter.get("/admin/logs/system", 
  verifyToken, 
  isAdmin, 
  apiLimiter, 
  cacheMiddleware, 
  getSystemLogs
);

moderationRouter.get("/admin/logs/audit", 
  verifyToken, 
  isAdmin, 
  apiLimiter, 
  cacheMiddleware, 
  getAuditLogs
);

moderationRouter.put("/admin/settings", 
  verifyToken, 
  isAdmin, 
  apiLimiter, 
  validate(moderationValidation.updateSettings), 
  updateSystemSettings
);

moderationRouter.get("/admin/health", 
  verifyToken, 
  isAdmin, 
  apiLimiter, 
  cacheMiddleware, 
  getSystemHealth
);

export default moderationRouter; 