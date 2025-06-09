import express from "express";
import {
  // Category management
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryStats,
  
  // Tag management
  createTag,
  updateTag,
  deleteTag,
  getTags,
  getTagById,
  getTagStats,
  
  // Badge management
  createBadge,
  updateBadge,
  deleteBadge,
  getBadges,
  getBadgeById,
  awardBadge,
  
  // Achievement management
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,
  getAchievementById,
  awardAchievement
} from "../controllers/contentController.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { cacheMiddleware } from "../services/cacheService.js";
import { validate } from "../middleware/validation.js";
import { contentValidation } from "../middleware/validation.js";

const contentRouter = express.Router();

// Category routes
contentRouter.post("/categories",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.createCategory),
  createCategory
);

contentRouter.put("/categories/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.updateCategory),
  updateCategory
);

contentRouter.delete("/categories/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  deleteCategory
);

contentRouter.get("/categories",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getCategories
);

contentRouter.get("/categories/:id",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getCategoryById
);

contentRouter.get("/categories/:id/stats",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getCategoryStats
);

// Tag routes
contentRouter.post("/tags",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.createTag),
  createTag
);

contentRouter.put("/tags/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.updateTag),
  updateTag
);

contentRouter.delete("/tags/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  deleteTag
);

contentRouter.get("/tags",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getTags
);

contentRouter.get("/tags/:id",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getTagById
);

contentRouter.get("/tags/:id/stats",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getTagStats
);

// Badge routes
contentRouter.post("/badges",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.createBadge),
  createBadge
);

contentRouter.put("/badges/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.updateBadge),
  updateBadge
);

contentRouter.delete("/badges/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  deleteBadge
);

contentRouter.get("/badges",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getBadges
);

contentRouter.get("/badges/:id",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getBadgeById
);

contentRouter.post("/badges/:id/award",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.awardBadge),
  awardBadge
);

// Achievement routes
contentRouter.post("/achievements",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.createAchievement),
  createAchievement
);

contentRouter.put("/achievements/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.updateAchievement),
  updateAchievement
);

contentRouter.delete("/achievements/:id",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  deleteAchievement
);

contentRouter.get("/achievements",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getAchievements
);

contentRouter.get("/achievements/:id",
  verifyToken,
  apiLimiter,
  cacheMiddleware,
  getAchievementById
);

contentRouter.post("/achievements/:id/award",
  verifyToken,
  verifyAdmin,
  apiLimiter,
  validate(contentValidation.awardAchievement),
  awardAchievement
);

export default contentRouter; 