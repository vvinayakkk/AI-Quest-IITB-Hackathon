import express from "express";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  updatePrivacy,
  getReputation,
  getReputationHistory,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  saveItem,
  unsaveItem,
  getSavedItems,
  getActivityHistory,
  uploadAvatar,
  deleteAvatar,
  addSocialLink,
  removeSocialLink,
  getTopUsers
} from "../controllers/userProfileController.js";
import { verifyToken } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validation.js";
import { cacheMiddleware } from "../services/cacheService.js";
import { upload } from "../services/uploadService.js";

const router = express.Router();

// Profile Management
router.get("/:username", cacheMiddleware(300), getProfile);
router.put("/", verifyToken, rateLimit(10), validate("updateProfile"), updateProfile);
router.put("/preferences", verifyToken, rateLimit(10), validate("updatePreferences"), updatePreferences);
router.put("/privacy", verifyToken, rateLimit(10), validate("updatePrivacy"), updatePrivacy);

// Avatar Management
router.post("/avatar", verifyToken, rateLimit(5), upload.single("avatar"), uploadAvatar);
router.delete("/avatar", verifyToken, rateLimit(5), deleteAvatar);

// Social Links
router.post("/social-links", verifyToken, rateLimit(10), validate("addSocialLink"), addSocialLink);
router.delete("/social-links/:platform", verifyToken, rateLimit(10), removeSocialLink);

// Reputation
router.get("/:username/reputation", cacheMiddleware(300), getReputation);
router.get("/:username/reputation/history", verifyToken, rateLimit(20), getReputationHistory);

// Following System
router.post("/:username/follow", verifyToken, rateLimit(20), followUser);
router.delete("/:username/follow", verifyToken, rateLimit(20), unfollowUser);
router.get("/:username/following", cacheMiddleware(300), getFollowing);
router.get("/:username/followers", cacheMiddleware(300), getFollowers);

// Saved Items
router.post("/saved-items", verifyToken, rateLimit(20), validate("saveItem"), saveItem);
router.delete("/saved-items/:type/:id", verifyToken, rateLimit(20), unsaveItem);
router.get("/saved-items", verifyToken, rateLimit(20), getSavedItems);

// Activity History
router.get("/:username/activity", verifyToken, rateLimit(20), getActivityHistory);

// Top Users
router.get("/top", cacheMiddleware(300), getTopUsers);

export default router; 