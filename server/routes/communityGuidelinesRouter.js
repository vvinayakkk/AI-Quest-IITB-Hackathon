import express from "express";
import {
  createGuidelines,
  getPublishedGuidelines,
  getGuidelinesByCategory,
  getGuidelines,
  updateGuidelines,
  publishGuidelines,
  archiveGuidelines,
} from "../controllers/communityGuidelinesController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import {
  createGuidelinesSchema,
  updateGuidelinesSchema,
} from "../validation/communityGuidelinesValidation.js";

const router = express.Router();

// Create guidelines
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validate(createGuidelinesSchema),
  createGuidelines
);

// Get published guidelines
router.get("/published", getPublishedGuidelines);

// Get guidelines by category
router.get("/category/:category", getGuidelinesByCategory);

// Get guidelines by ID
router.get("/:id", getGuidelines);

// Update guidelines
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validate(updateGuidelinesSchema),
  updateGuidelines
);

// Publish guidelines
router.put(
  "/:id/publish",
  authenticate,
  authorize(["admin"]),
  publishGuidelines
);

// Archive guidelines
router.put(
  "/:id/archive",
  authenticate,
  authorize(["admin"]),
  archiveGuidelines
);

export default router; 