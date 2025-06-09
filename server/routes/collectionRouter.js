import express from "express";
import {
  createCollection,
  getUserCollections,
  getPublicCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  addItem,
  removeItem,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
} from "../controllers/collectionController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
  addItemSchema,
  addCollaboratorSchema,
  updateCollaboratorRoleSchema,
} from "../validation/collectionValidation.js";

const router = express.Router();

// Create collection
router.post(
  "/",
  authenticate,
  validate(createCollectionSchema),
  createCollection
);

// Get user's collections
router.get("/user", authenticate, getUserCollections);

// Get public collections
router.get("/public", getPublicCollections);

// Get collection by ID
router.get("/:id", authenticate, getCollection);

// Update collection
router.put(
  "/:id",
  authenticate,
  validate(updateCollectionSchema),
  updateCollection
);

// Delete collection
router.delete("/:id", authenticate, deleteCollection);

// Add item to collection
router.post(
  "/:id/items",
  authenticate,
  validate(addItemSchema),
  addItem
);

// Remove item from collection
router.delete("/:id/items/:itemId", authenticate, removeItem);

// Add collaborator
router.post(
  "/:id/collaborators",
  authenticate,
  validate(addCollaboratorSchema),
  addCollaborator
);

// Remove collaborator
router.delete(
  "/:id/collaborators/:userId",
  authenticate,
  removeCollaborator
);

// Update collaborator role
router.put(
  "/:id/collaborators/:userId/role",
  authenticate,
  validate(updateCollaboratorRoleSchema),
  updateCollaboratorRole
);

export default router; 