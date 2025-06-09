import express from "express";
import {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  getCommentReplies,
  voteComment,
  markAsAnswer,
  reportComment,
  getCommentStats
} from "../controllers/commentController.js";
import { validate } from "../middleware/validation.js";
import { commentValidation } from "../middleware/validation.js";
import { verifyToken, isOwner } from "../middleware/auth.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { cacheMiddleware } from "../services/cacheService.js";

const commentRouter = express.Router();

// Public routes
commentRouter.get("/:id", apiLimiter, cacheMiddleware, getComment);
commentRouter.get("/:id/replies", apiLimiter, cacheMiddleware, getCommentReplies);
commentRouter.get("/:id/stats", apiLimiter, cacheMiddleware, getCommentStats);

// Protected routes
commentRouter.post("/", 
  verifyToken, 
  apiLimiter, 
  validate(commentValidation.createComment), 
  createComment
);

commentRouter.put("/:id", 
  verifyToken, 
  apiLimiter, 
  validate(commentValidation.updateComment), 
  isOwner, 
  updateComment
);

commentRouter.delete("/:id", 
  verifyToken, 
  apiLimiter, 
  isOwner, 
  deleteComment
);

commentRouter.post("/:id/vote", 
  verifyToken, 
  apiLimiter, 
  validate(commentValidation.voteComment), 
  voteComment
);

commentRouter.post("/:id/answer", 
  verifyToken, 
  apiLimiter, 
  markAsAnswer
);

commentRouter.post("/:id/report", 
  verifyToken, 
  apiLimiter, 
  validate(commentValidation.reportComment), 
  reportComment
);

export default commentRouter; 