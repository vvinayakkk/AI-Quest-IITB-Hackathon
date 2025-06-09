import ContentFlag from "../models/ContentFlag.js";
import { logger } from "../utils/logger.js";

// Create a new content flag
export const createFlag = async (req, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;
    const userId = req.user.id;

    const flag = new ContentFlag({
      reporter: userId,
      contentType,
      contentId,
      reason,
      description,
    });

    await flag.save();
    logger.info(`Content flag created: ${flag._id}`);

    res.status(201).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    logger.error(`Error creating content flag: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error creating content flag",
    });
  }
};

// Get flags by content
export const getFlagsByContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;

    const flags = await ContentFlag.findByContent(contentType, contentId);
    logger.info(`Retrieved flags for content: ${contentType}/${contentId}`);

    res.status(200).json({
      success: true,
      data: flags,
    });
  } catch (error) {
    logger.error(`Error getting content flags: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting content flags",
    });
  }
};

// Get flags by status
export const getFlagsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const flags = await ContentFlag.findByStatus(status);
    logger.info(`Retrieved flags with status: ${status}`);

    res.status(200).json({
      success: true,
      data: flags,
    });
  } catch (error) {
    logger.error(`Error getting content flags: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting content flags",
    });
  }
};

// Get flags assigned to moderator
export const getModeratorFlags = async (req, res) => {
  try {
    const userId = req.user.id;

    const flags = await ContentFlag.findByModerator(userId);
    logger.info(`Retrieved flags for moderator: ${userId}`);

    res.status(200).json({
      success: true,
      data: flags,
    });
  } catch (error) {
    logger.error(`Error getting moderator flags: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting moderator flags",
    });
  }
};

// Assign flag to moderator
export const assignFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const flag = await ContentFlag.findById(id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        error: "Content flag not found",
      });
    }

    await flag.assign(userId);
    logger.info(`Assigned flag to moderator: ${id}`);

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    logger.error(`Error assigning flag: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error assigning flag",
    });
  }
};

// Resolve flag
export const resolveFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { action, notes } = req.body;

    const flag = await ContentFlag.findById(id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        error: "Content flag not found",
      });
    }

    // Check if user is assigned moderator
    if (flag.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to resolve this flag",
      });
    }

    await flag.resolve(action, notes, userId);
    logger.info(`Resolved flag: ${id}`);

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    logger.error(`Error resolving flag: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error resolving flag",
    });
  }
};

// Dismiss flag
export const dismissFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;

    const flag = await ContentFlag.findById(id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        error: "Content flag not found",
      });
    }

    // Check if user is assigned moderator
    if (flag.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to dismiss this flag",
      });
    }

    await flag.dismiss(notes, userId);
    logger.info(`Dismissed flag: ${id}`);

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    logger.error(`Error dismissing flag: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error dismissing flag",
    });
  }
};

// Update flag priority
export const updateFlagPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { priority } = req.body;

    const flag = await ContentFlag.findById(id);
    if (!flag) {
      return res.status(404).json({
        success: false,
        error: "Content flag not found",
      });
    }

    // Check if user is assigned moderator
    if (flag.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this flag",
      });
    }

    flag.priority = priority;
    await flag.save();
    logger.info(`Updated flag priority: ${id}`);

    res.status(200).json({
      success: true,
      data: flag,
    });
  } catch (error) {
    logger.error(`Error updating flag priority: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating flag priority",
    });
  }
}; 