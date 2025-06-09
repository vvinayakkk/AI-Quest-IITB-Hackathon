import CommunityGuidelines from "../models/CommunityGuidelines.js";
import { logger } from "../utils/logger.js";

// Create new guidelines
export const createGuidelines = async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;
    const userId = req.user.id;

    const guidelines = new CommunityGuidelines({
      title,
      content,
      category,
      priority,
      lastUpdatedBy: userId,
    });

    await guidelines.save();
    logger.info(`Community guidelines created: ${guidelines._id}`);

    res.status(201).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error creating community guidelines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error creating community guidelines",
    });
  }
};

// Get published guidelines
export const getPublishedGuidelines = async (req, res) => {
  try {
    const guidelines = await CommunityGuidelines.findPublished();
    logger.info("Retrieved published guidelines");

    res.status(200).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error getting published guidelines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting published guidelines",
    });
  }
};

// Get guidelines by category
export const getGuidelinesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const guidelines = await CommunityGuidelines.findByCategory(category);
    logger.info(`Retrieved guidelines for category: ${category}`);

    res.status(200).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error getting guidelines by category: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting guidelines by category",
    });
  }
};

// Get guidelines by ID
export const getGuidelines = async (req, res) => {
  try {
    const { id } = req.params;

    const guidelines = await CommunityGuidelines.findById(id);
    if (!guidelines) {
      return res.status(404).json({
        success: false,
        error: "Community guidelines not found",
      });
    }

    logger.info(`Retrieved guidelines: ${id}`);

    res.status(200).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error getting guidelines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting guidelines",
    });
  }
};

// Update guidelines
export const updateGuidelines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, category, priority } = req.body;

    const guidelines = await CommunityGuidelines.findById(id);
    if (!guidelines) {
      return res.status(404).json({
        success: false,
        error: "Community guidelines not found",
      });
    }

    guidelines.title = title || guidelines.title;
    guidelines.content = content || guidelines.content;
    guidelines.category = category || guidelines.category;
    guidelines.priority = priority || guidelines.priority;
    guidelines.lastUpdatedBy = userId;

    await guidelines.updateVersion(userId);
    logger.info(`Updated guidelines: ${id}`);

    res.status(200).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error updating guidelines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating guidelines",
    });
  }
};

// Publish guidelines
export const publishGuidelines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const guidelines = await CommunityGuidelines.findById(id);
    if (!guidelines) {
      return res.status(404).json({
        success: false,
        error: "Community guidelines not found",
      });
    }

    await guidelines.publish(userId);
    logger.info(`Published guidelines: ${id}`);

    res.status(200).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error publishing guidelines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error publishing guidelines",
    });
  }
};

// Archive guidelines
export const archiveGuidelines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const guidelines = await CommunityGuidelines.findById(id);
    if (!guidelines) {
      return res.status(404).json({
        success: false,
        error: "Community guidelines not found",
      });
    }

    await guidelines.archive(userId);
    logger.info(`Archived guidelines: ${id}`);

    res.status(200).json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error(`Error archiving guidelines: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error archiving guidelines",
    });
  }
}; 