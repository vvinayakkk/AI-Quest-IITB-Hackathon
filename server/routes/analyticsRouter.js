import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { cache } from "../middleware/cache.js";
import { validate } from "../middleware/validation.js";
import {
  getPostAnalytics,
  getUserAnalytics,
  getCategoryAnalytics,
  getTagAnalytics,
  getPlatformStats,
  getEngagementMetrics,
  getGrowthMetrics,
  getModerationStats
} from "../controllers/analyticsController.js";

const router = express.Router();

// All routes require admin access
router.use(verifyToken, verifyAdmin);

// Post Analytics
router.get("/posts", rateLimit, cache("5m"), getPostAnalytics);

// User Analytics
router.get("/users", rateLimit, cache("5m"), getUserAnalytics);

// Category Analytics
router.get("/categories", rateLimit, cache("5m"), getCategoryAnalytics);

// Tag Analytics
router.get("/tags", rateLimit, cache("5m"), getTagAnalytics);

// Platform Statistics
router.get("/platform", rateLimit, cache("5m"), getPlatformStats);

// Engagement Metrics
router.get("/engagement", rateLimit, cache("5m"), getEngagementMetrics);

// Growth Metrics
router.get("/growth", rateLimit, cache("5m"), getGrowthMetrics);

// Moderation Statistics
router.get("/moderation", rateLimit, cache("5m"), getModerationStats);

export default router; 