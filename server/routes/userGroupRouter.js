import express from "express";
import {
  createGroup,
  getUserGroups,
  getPublicGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  updateMemberRole,
  addAdmin,
  removeAdmin,
  updateAdminRole,
} from "../controllers/userGroupController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  addAdminSchema,
  updateAdminRoleSchema,
} from "../validation/userGroupValidation.js";

const router = express.Router();

// Create group
router.post(
  "/",
  authenticate,
  validate(createGroupSchema),
  createGroup
);

// Get user's groups
router.get("/user", authenticate, getUserGroups);

// Get public groups
router.get("/public", getPublicGroups);

// Get group by ID
router.get("/:id", authenticate, getGroup);

// Update group
router.put(
  "/:id",
  authenticate,
  validate(updateGroupSchema),
  updateGroup
);

// Delete group
router.delete("/:id", authenticate, deleteGroup);

// Add member
router.post(
  "/:id/members",
  authenticate,
  validate(addMemberSchema),
  addMember
);

// Remove member
router.delete(
  "/:id/members/:userId",
  authenticate,
  removeMember
);

// Update member role
router.put(
  "/:id/members/:userId/role",
  authenticate,
  validate(updateMemberRoleSchema),
  updateMemberRole
);

// Add admin
router.post(
  "/:id/admins",
  authenticate,
  validate(addAdminSchema),
  addAdmin
);

// Remove admin
router.delete(
  "/:id/admins/:userId",
  authenticate,
  removeAdmin
);

// Update admin role
router.put(
  "/:id/admins/:userId/role",
  authenticate,
  validate(updateAdminRoleSchema),
  updateAdminRole
);

export default router; 