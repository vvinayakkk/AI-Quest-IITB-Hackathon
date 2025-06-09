import express from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  searchPosts,
  getTrendingPosts,
  getPostsByTag,
  getPostsByCategory,
  getPostsByUser,
  votePost,
  bookmarkPost,
  reportPost,
  getPostStats
} from "../controllers/postController.js";
import { validate } from "../middleware/validation.js";
import { postValidation } from "../middleware/validation.js";
import { verifyToken, isOwner } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { cacheMiddleware } from "../services/cacheService.js";

const postRouter = express.Router();

// Public routes
postRouter.get("/search", apiLimiter, searchPosts);
postRouter.get("/trending", apiLimiter, cacheMiddleware, getTrendingPosts);
postRouter.get("/tag/:tag", apiLimiter, cacheMiddleware, getPostsByTag);
postRouter.get("/category/:category", apiLimiter, cacheMiddleware, getPostsByCategory);
postRouter.get("/user/:userId", apiLimiter, cacheMiddleware, getPostsByUser);
postRouter.get("/:id", apiLimiter, cacheMiddleware, getPost);
postRouter.get("/:id/stats", apiLimiter, cacheMiddleware, getPostStats);

// Protected routes
postRouter.post("/", 
  verifyToken, 
  apiLimiter, 
  validate(postValidation.createPost), 
  createPost
);

postRouter.put("/:id", 
  verifyToken, 
  apiLimiter, 
  validate(postValidation.updatePost), 
  isOwner, 
  updatePost
);

postRouter.delete("/:id", 
  verifyToken, 
  apiLimiter, 
  isOwner, 
  deletePost
);

postRouter.post("/:id/vote", 
  verifyToken, 
  apiLimiter, 
  validate(postValidation.votePost), 
  votePost
);

postRouter.post("/:id/bookmark", 
  verifyToken, 
  apiLimiter, 
  bookmarkPost
);

postRouter.post("/:id/report", 
  verifyToken, 
  apiLimiter, 
  validate(postValidation.reportPost), 
  reportPost
);

export default postRouter;
