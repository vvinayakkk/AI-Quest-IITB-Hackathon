import Collection from "../models/Collection.js";
import { logger } from "../utils/logger.js";

// Create a new collection
export const createCollection = async (req, res) => {
  try {
    const { name, description, type, visibility, tags } = req.body;
    const userId = req.user.id;

    const collection = new Collection({
      user: userId,
      name,
      description,
      type,
      visibility,
      tags,
    });

    await collection.save();
    logger.info(`Collection created: ${collection._id}`);

    res.status(201).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error creating collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error creating collection",
    });
  }
};

// Get user's collections
export const getUserCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const collections = await Collection.findByUser(userId, type);
    logger.info(`Retrieved collections for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (error) {
    logger.error(`Error getting user collections: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting collections",
    });
  }
};

// Get public collections
export const getPublicCollections = async (req, res) => {
  try {
    const { type } = req.query;

    const collections = await Collection.findPublic(type);
    logger.info("Retrieved public collections");

    res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (error) {
    logger.error(`Error getting public collections: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting collections",
    });
  }
};

// Get collection by ID
export const getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has access
    if (
      collection.visibility === "private" &&
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) => collab.user.toString() === userId
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this collection",
      });
    }

    logger.info(`Retrieved collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error getting collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting collection",
    });
  }
};

// Update collection
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, visibility, tags } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to update
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId &&
          ["admin", "editor"].includes(collab.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this collection",
      });
    }

    collection.name = name || collection.name;
    collection.description = description || collection.description;
    collection.visibility = visibility || collection.visibility;
    collection.tags = tags || collection.tags;

    await collection.save();
    logger.info(`Updated collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error updating collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating collection",
    });
  }
};

// Delete collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to delete
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId && collab.role === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this collection",
      });
    }

    collection.status = "deleted";
    await collection.save();
    logger.info(`Deleted collection: ${id}`);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error(`Error deleting collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error deleting collection",
    });
  }
};

// Add item to collection
export const addItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { itemType, itemId, notes } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to add items
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId &&
          ["admin", "editor"].includes(collab.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add items to this collection",
      });
    }

    await collection.addItem(itemType, itemId, notes);
    logger.info(`Added item to collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error adding item to collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error adding item to collection",
    });
  }
};

// Remove item from collection
export const removeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { itemType, itemId } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to remove items
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId &&
          ["admin", "editor"].includes(collab.role)
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to remove items from this collection",
      });
    }

    await collection.removeItem(itemType, itemId);
    logger.info(`Removed item from collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error removing item from collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error removing item from collection",
    });
  }
};

// Add collaborator to collection
export const addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { collaboratorId, role } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to add collaborators
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId && collab.role === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add collaborators to this collection",
      });
    }

    await collection.addCollaborator(collaboratorId, role);
    logger.info(`Added collaborator to collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error adding collaborator to collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error adding collaborator to collection",
    });
  }
};

// Remove collaborator from collection
export const removeCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { collaboratorId } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to remove collaborators
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId && collab.role === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to remove collaborators from this collection",
      });
    }

    await collection.removeCollaborator(collaboratorId);
    logger.info(`Removed collaborator from collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error removing collaborator from collection: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error removing collaborator from collection",
    });
  }
};

// Update collaborator role
export const updateCollaboratorRole = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { collaboratorId, newRole } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // Check if user has permission to update collaborator roles
    if (
      collection.user.toString() !== userId &&
      !collection.collaborators.some(
        (collab) =>
          collab.user.toString() === userId && collab.role === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update collaborator roles in this collection",
      });
    }

    await collection.updateCollaboratorRole(collaboratorId, newRole);
    logger.info(`Updated collaborator role in collection: ${id}`);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    logger.error(`Error updating collaborator role: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error updating collaborator role",
    });
  }
}; 