import UserGroup from "../models/UserGroup.js";
import { logger } from "../utils/logger.js";

// Create a new user group
export const createGroup = async (req, res) => {
  try {
    const { name, description, type, settings, tags } = req.body;
    const userId = req.user.id;

    const group = new UserGroup({
      name,
      description,
      type,
      creator: userId,
      settings,
      tags,
    });

    // Add creator as owner
    await group.addAdmin(userId, "owner");

    await group.save();
    logger.info(`User group created: ${group._id}`);

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error creating user group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error creating user group",
    });
  }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await UserGroup.findByUser(userId);
    logger.info(`Retrieved groups for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    logger.error(`Error getting user groups: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting user groups",
    });
  }
};

// Get public groups
export const getPublicGroups = async (req, res) => {
  try {
    const groups = await UserGroup.findPublic();
    logger.info("Retrieved public groups");

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    logger.error(`Error getting public groups: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting public groups",
    });
  }
};

// Get group by ID
export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has access
    if (
      group.type === "private" &&
      group.creator.toString() !== userId &&
      !group.members.some((member) => member.user.toString() === userId) &&
      !group.admins.some((admin) => admin.user.toString() === userId)
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this group",
      });
    }

    logger.info(`Retrieved group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error getting group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting group",
    });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, type, settings, tags } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to update
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId &&
          ["owner", "admin"].includes(admin.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this group",
      });
    }

    group.name = name || group.name;
    group.description = description || group.description;
    group.type = type || group.type;
    group.settings = settings || group.settings;
    group.tags = tags || group.tags;

    await group.save();
    logger.info(`Updated group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error updating group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating group",
    });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to delete
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId && admin.role === "owner"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this group",
      });
    }

    group.status = "deleted";
    await group.save();
    logger.info(`Deleted group: ${id}`);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error(`Error deleting group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error deleting group",
    });
  }
};

// Add member to group
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { memberId, role } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to add members
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId &&
          ["owner", "admin"].includes(admin.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add members to this group",
      });
    }

    await group.addMember(memberId, role);
    logger.info(`Added member to group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error adding member to group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error adding member to group",
    });
  }
};

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { memberId } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to remove members
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId &&
          ["owner", "admin"].includes(admin.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to remove members from this group",
      });
    }

    await group.removeMember(memberId);
    logger.info(`Removed member from group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error removing member from group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error removing member from group",
    });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { memberId, newRole } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to update member roles
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId &&
          ["owner", "admin"].includes(admin.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update member roles in this group",
      });
    }

    await group.updateMemberRole(memberId, newRole);
    logger.info(`Updated member role in group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error updating member role: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating member role",
    });
  }
};

// Add admin to group
export const addAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { adminId, role } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to add admins
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId && admin.role === "owner"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add admins to this group",
      });
    }

    await group.addAdmin(adminId, role);
    logger.info(`Added admin to group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error adding admin to group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error adding admin to group",
    });
  }
};

// Remove admin from group
export const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { adminId } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to remove admins
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId && admin.role === "owner"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to remove admins from this group",
      });
    }

    await group.removeAdmin(adminId);
    logger.info(`Removed admin from group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error removing admin from group: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error removing admin from group",
    });
  }
};

// Update admin role
export const updateAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { adminId, newRole } = req.body;

    const group = await UserGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: "User group not found",
      });
    }

    // Check if user has permission to update admin roles
    if (
      group.creator.toString() !== userId &&
      !group.admins.some(
        (admin) =>
          admin.user.toString() === userId && admin.role === "owner"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update admin roles in this group",
      });
    }

    await group.updateAdminRole(adminId, newRole);
    logger.info(`Updated admin role in group: ${id}`);

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error(`Error updating admin role: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating admin role",
    });
  }
}; 