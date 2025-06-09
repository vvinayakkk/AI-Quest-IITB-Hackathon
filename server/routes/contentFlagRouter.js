import express from "express";
import {
  createFlag,
  getFlagsByContent,
  getFlagsByStatus,
  getModeratorFlags,
  assignFlag,
  resolveFlag,
  dismissFlag,
  updateFlagPriority,
} from "../controllers/contentFlagController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import {
  createFlagSchema,
  resolveFlagSchema,
  updateFlagPrioritySchema,
} from "../validation/contentFlagValidation.js";

const router = express.Router();

// Create flag
router.post(
  "/",
  authenticate,
  validate(createFlagSchema),
  createFlag
);

// Get flags by content
router.get(
  "/content/:contentType/:contentId",
  authenticate,
  getFlagsByContent
);

// Get flags by status
router.get(
  "/status/:status",
  authenticate,
  authorize(["moderator", "admin"]),
  getFlagsByStatus
);

// Get moderator's assigned flags
router.get(
  "/moderator",
  authenticate,
  authorize(["moderator", "admin"]),
  getModeratorFlags
);

// Assign flag to moderator
router.put(
  "/:id/assign",
  authenticate,
  authorize(["moderator", "admin"]),
  assignFlag
);

// Resolve flag
router.put(
  "/:id/resolve",
  authenticate,
  authorize(["moderator", "admin"]),
  validate(resolveFlagSchema),
  resolveFlag
);

// Dismiss flag
router.put(
  "/:id/dismiss",
  authenticate,
  authorize(["moderator", "admin"]),
  dismissFlag
);

// Update flag priority
router.put(
  "/:id/priority",
  authenticate,
  authorize(["moderator", "admin"]),
  validate(updateFlagPrioritySchema),
  updateFlagPriority
);

export default router; 