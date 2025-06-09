import express from "express";
import {
  searchPosts,
  searchUsers,
  searchTags,
  searchCategories,
  getTrendingPosts,
  getPopularTags,
  getActiveUsers,
  getRelatedPosts
} from "../controllers/searchController.js";
import { verifyToken } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { cacheMiddleware } from "../services/cacheService.js";

const searchRouter = express.Router();

// Search routes
searchRouter.get("/posts", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  searchPosts
);

searchRouter.get("/users", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  searchUsers
);

searchRouter.get("/tags", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  searchTags
);

searchRouter.get("/categories", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  searchCategories
);

// Discovery routes
searchRouter.get("/trending", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getTrendingPosts
);

searchRouter.get("/tags/popular", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getPopularTags
);

searchRouter.get("/users/active", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getActiveUsers
);

searchRouter.get("/posts/:id/related", 
  verifyToken, 
  apiLimiter, 
  cacheMiddleware, 
  getRelatedPosts
);

export default searchRouter; 