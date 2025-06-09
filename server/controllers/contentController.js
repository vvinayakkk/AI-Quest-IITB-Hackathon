import { Category, Tag, Badge, Achievement, User, Post } from "../models/index.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { clearCacheByPattern } from "../services/cacheService.js";
import { sendNotificationEmail } from "../services/emailService.js";

// Category Controllers
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, parent } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new ValidationError("Category with this name already exists");
    }

    // If parent is provided, verify it exists
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const category = await Category.create({
      name,
      description,
      icon,
      color,
      parent,
      createdBy: req.user.id
    });

    await clearCacheByPattern("categories:*");

    res.status(201).json(category);
  } catch (error) {
    logger.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, parent, active } = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // If name is being changed, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        throw new ValidationError("Category with this name already exists");
      }
    }

    // If parent is being changed, verify it exists
    if (parent && parent !== category.parent?.toString()) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, icon, color, parent, active },
      { new: true }
    );

    await clearCacheByPattern("categories:*");

    res.json(updatedCategory);
  } catch (error) {
    logger.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check if category has posts
    const postCount = await Post.countDocuments({ category: id });
    if (postCount > 0) {
      throw new ValidationError("Cannot delete category with existing posts");
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      throw new ValidationError("Cannot delete category with existing subcategories");
    }

    await Category.findByIdAndDelete(id);

    await clearCacheByPattern("categories:*");

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    logger.error("Error deleting category:", error);
    throw error;
  }
};

export const getCategories = async (req, res) => {
  try {
    const { active, parent } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === "true";
    }

    if (parent === "null") {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    const categories = await Category.find(query)
      .populate("parent", "name")
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    logger.error("Error getting categories:", error);
    throw error;
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate("parent", "name")
      .populate("createdBy", "username");

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    res.json(category);
  } catch (error) {
    logger.error("Error getting category:", error);
    throw error;
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [
      postCount,
      subcategoryCount,
      avgViews,
      avgVotes,
      avgComments
    ] = await Promise.all([
      Post.countDocuments({ category: id }),
      Category.countDocuments({ parent: id }),
      Post.aggregate([
        { $match: { category: id } },
        { $group: { _id: null, avg: { $avg: "$views" } } }
      ]),
      Post.aggregate([
        { $match: { category: id } },
        { $group: { _id: null, avg: { $avg: "$votes" } } }
      ]),
      Post.aggregate([
        { $match: { category: id } },
        { $group: { _id: null, avg: { $avg: "$commentCount" } } }
      ])
    ]);

    res.json({
      postCount,
      subcategoryCount,
      averages: {
        views: avgViews[0]?.avg || 0,
        votes: avgVotes[0]?.avg || 0,
        comments: avgComments[0]?.avg || 0
      }
    });
  } catch (error) {
    logger.error("Error getting category stats:", error);
    throw error;
  }
};

// Tag Controllers
export const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check if tag with same name exists
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      throw new ValidationError("Tag with this name already exists");
    }

    const tag = await Tag.create({
      name,
      description,
      color,
      createdBy: req.user.id
    });

    await clearCacheByPattern("tags:*");

    res.status(201).json(tag);
  } catch (error) {
    logger.error("Error creating tag:", error);
    throw error;
  }
};

export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, active } = req.body;

    // Check if tag exists
    const tag = await Tag.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    // If name is being changed, check for duplicates
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ name });
      if (existingTag) {
        throw new ValidationError("Tag with this name already exists");
      }
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name, description, color, active },
      { new: true }
    );

    await clearCacheByPattern("tags:*");

    res.json(updatedTag);
  } catch (error) {
    logger.error("Error updating tag:", error);
    throw error;
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const tag = await Tag.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    // Check if tag is used in posts
    const postCount = await Post.countDocuments({ tags: id });
    if (postCount > 0) {
      throw new ValidationError("Cannot delete tag that is used in posts");
    }

    await Tag.findByIdAndDelete(id);

    await clearCacheByPattern("tags:*");

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    logger.error("Error deleting tag:", error);
    throw error;
  }
};

export const getTags = async (req, res) => {
  try {
    const { active } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === "true";
    }

    const tags = await Tag.find(query)
      .populate("createdBy", "username")
      .sort({ name: 1 });

    res.json(tags);
  } catch (error) {
    logger.error("Error getting tags:", error);
    throw error;
  }
};

export const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id)
      .populate("createdBy", "username");

    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    res.json(tag);
  } catch (error) {
    logger.error("Error getting tag:", error);
    throw error;
  }
};

export const getTagStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [
      postCount,
      avgViews,
      avgVotes,
      avgComments
    ] = await Promise.all([
      Post.countDocuments({ tags: id }),
      Post.aggregate([
        { $match: { tags: id } },
        { $group: { _id: null, avg: { $avg: "$views" } } }
      ]),
      Post.aggregate([
        { $match: { tags: id } },
        { $group: { _id: null, avg: { $avg: "$votes" } } }
      ]),
      Post.aggregate([
        { $match: { tags: id } },
        { $group: { _id: null, avg: { $avg: "$commentCount" } } }
      ])
    ]);

    res.json({
      postCount,
      averages: {
        views: avgViews[0]?.avg || 0,
        votes: avgVotes[0]?.avg || 0,
        comments: avgComments[0]?.avg || 0
      }
    });
  } catch (error) {
    logger.error("Error getting tag stats:", error);
    throw error;
  }
};

// Badge Controllers
export const createBadge = async (req, res) => {
  try {
    const { name, description, icon, color, type, criteria } = req.body;

    // Check if badge with same name exists
    const existingBadge = await Badge.findOne({ name });
    if (existingBadge) {
      throw new ValidationError("Badge with this name already exists");
    }

    const badge = await Badge.create({
      name,
      description,
      icon,
      color,
      type,
      criteria,
      createdBy: req.user.id
    });

    await clearCacheByPattern("badges:*");

    res.status(201).json(badge);
  } catch (error) {
    logger.error("Error creating badge:", error);
    throw error;
  }
};

export const updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, active, criteria } = req.body;

    // Check if badge exists
    const badge = await Badge.findById(id);
    if (!badge) {
      throw new NotFoundError("Badge not found");
    }

    // If name is being changed, check for duplicates
    if (name && name !== badge.name) {
      const existingBadge = await Badge.findOne({ name });
      if (existingBadge) {
        throw new ValidationError("Badge with this name already exists");
      }
    }

    const updatedBadge = await Badge.findByIdAndUpdate(
      id,
      { name, description, icon, color, active, criteria },
      { new: true }
    );

    await clearCacheByPattern("badges:*");

    res.json(updatedBadge);
  } catch (error) {
    logger.error("Error updating badge:", error);
    throw error;
  }
};

export const deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if badge exists
    const badge = await Badge.findById(id);
    if (!badge) {
      throw new NotFoundError("Badge not found");
    }

    // Check if badge is awarded to users
    const userCount = await User.countDocuments({ badges: id });
    if (userCount > 0) {
      throw new ValidationError("Cannot delete badge that is awarded to users");
    }

    await Badge.findByIdAndDelete(id);

    await clearCacheByPattern("badges:*");

    res.json({ message: "Badge deleted successfully" });
  } catch (error) {
    logger.error("Error deleting badge:", error);
    throw error;
  }
};

export const getBadges = async (req, res) => {
  try {
    const { active, type } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === "true";
    }

    if (type) {
      query.type = type;
    }

    const badges = await Badge.find(query)
      .populate("createdBy", "username")
      .sort({ name: 1 });

    res.json(badges);
  } catch (error) {
    logger.error("Error getting badges:", error);
    throw error;
  }
};

export const getBadgeById = async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await Badge.findById(id)
      .populate("createdBy", "username");

    if (!badge) {
      throw new NotFoundError("Badge not found");
    }

    res.json(badge);
  } catch (error) {
    logger.error("Error getting badge:", error);
    throw error;
  }
};

export const awardBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    // Check if badge exists
    const badge = await Badge.findById(id);
    if (!badge) {
      throw new NotFoundError("Badge not found");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user already has the badge
    if (user.badges.includes(id)) {
      throw new ValidationError("User already has this badge");
    }

    // Add badge to user
    user.badges.push(id);
    await user.save();

    // Send notification email
    await sendNotificationEmail({
      to: user.email,
      type: "badge",
      data: {
        userName: user.username,
        badgeName: badge.name,
        reason
      }
    });

    await clearCacheByPattern(`users:${userId}:*`);
    await clearCacheByPattern("badges:*");

    res.json({ message: "Badge awarded successfully" });
  } catch (error) {
    logger.error("Error awarding badge:", error);
    throw error;
  }
};

// Achievement Controllers
export const createAchievement = async (req, res) => {
  try {
    const { name, description, icon, points, type, criteria } = req.body;

    // Check if achievement with same name exists
    const existingAchievement = await Achievement.findOne({ name });
    if (existingAchievement) {
      throw new ValidationError("Achievement with this name already exists");
    }

    const achievement = await Achievement.create({
      name,
      description,
      icon,
      points,
      type,
      criteria,
      createdBy: req.user.id
    });

    await clearCacheByPattern("achievements:*");

    res.status(201).json(achievement);
  } catch (error) {
    logger.error("Error creating achievement:", error);
    throw error;
  }
};

export const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, points, active, criteria } = req.body;

    // Check if achievement exists
    const achievement = await Achievement.findById(id);
    if (!achievement) {
      throw new NotFoundError("Achievement not found");
    }

    // If name is being changed, check for duplicates
    if (name && name !== achievement.name) {
      const existingAchievement = await Achievement.findOne({ name });
      if (existingAchievement) {
        throw new ValidationError("Achievement with this name already exists");
      }
    }

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      id,
      { name, description, icon, points, active, criteria },
      { new: true }
    );

    await clearCacheByPattern("achievements:*");

    res.json(updatedAchievement);
  } catch (error) {
    logger.error("Error updating achievement:", error);
    throw error;
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if achievement exists
    const achievement = await Achievement.findById(id);
    if (!achievement) {
      throw new NotFoundError("Achievement not found");
    }

    // Check if achievement is awarded to users
    const userCount = await User.countDocuments({ achievements: id });
    if (userCount > 0) {
      throw new ValidationError("Cannot delete achievement that is awarded to users");
    }

    await Achievement.findByIdAndDelete(id);

    await clearCacheByPattern("achievements:*");

    res.json({ message: "Achievement deleted successfully" });
  } catch (error) {
    logger.error("Error deleting achievement:", error);
    throw error;
  }
};

export const getAchievements = async (req, res) => {
  try {
    const { active, type } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === "true";
    }

    if (type) {
      query.type = type;
    }

    const achievements = await Achievement.find(query)
      .populate("createdBy", "username")
      .sort({ name: 1 });

    res.json(achievements);
  } catch (error) {
    logger.error("Error getting achievements:", error);
    throw error;
  }
};

export const getAchievementById = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findById(id)
      .populate("createdBy", "username");

    if (!achievement) {
      throw new NotFoundError("Achievement not found");
    }

    res.json(achievement);
  } catch (error) {
    logger.error("Error getting achievement:", error);
    throw error;
  }
};

export const awardAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    // Check if achievement exists
    const achievement = await Achievement.findById(id);
    if (!achievement) {
      throw new NotFoundError("Achievement not found");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user already has the achievement
    if (user.achievements.includes(id)) {
      throw new ValidationError("User already has this achievement");
    }

    // Add achievement to user and update points
    user.achievements.push(id);
    user.points += achievement.points;
    await user.save();

    // Send notification email
    await sendNotificationEmail({
      to: user.email,
      type: "achievement",
      data: {
        userName: user.username,
        achievementName: achievement.name,
        points: achievement.points,
        reason
      }
    });

    await clearCacheByPattern(`users:${userId}:*`);
    await clearCacheByPattern("achievements:*");

    res.json({ message: "Achievement awarded successfully" });
  } catch (error) {
    logger.error("Error awarding achievement:", error);
    throw error;
  }
}; 