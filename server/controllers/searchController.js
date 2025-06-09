import { Post, User, Tag, Category } from "../models/index.js";
import { NotFoundError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { clearCacheByPattern } from "../services/cacheService.js";

// Search Controllers
export const searchPosts = async (req, res) => {
  try {
    const { query, category, tags, sort = "relevance", page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    if (tags) {
      const tagArray = tags.split(",");
      searchQuery.tags = { $in: tagArray };
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "votes":
        sortOptions = { votes: -1 };
        break;
      case "views":
        sortOptions = { views: -1 };
        break;
      case "relevance":
      default:
        // If there's a search query, sort by text score
        if (query) {
          searchQuery.$text = { $search: query };
          sortOptions = { score: { $meta: "textScore" } };
        } else {
          sortOptions = { createdAt: -1 };
        }
    }

    const posts = await Post.find(searchQuery, sortOptions === { score: { $meta: "textScore" } } ? { score: { $meta: "textScore" } } : {})
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatar")
      .populate("category", "name")
      .populate("tags", "name");

    const total = await Post.countDocuments(searchQuery);

    res.json({
      posts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error searching posts:", error);
    throw error;
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query, sort = "reputation", page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {};
    if (query) {
      searchQuery.$or = [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "reputation":
        sortOptions = { reputation: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "activity":
        sortOptions = { lastActive: -1 };
        break;
      default:
        sortOptions = { reputation: -1 };
    }

    const users = await User.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-password -email");

    const total = await User.countDocuments(searchQuery);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error searching users:", error);
    throw error;
  }
};

export const searchTags = async (req, res) => {
  try {
    const { query, sort = "popularity", page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {};
    if (query) {
      searchQuery.name = { $regex: query, $options: "i" };
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "popularity":
        sortOptions = { postCount: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      default:
        sortOptions = { postCount: -1 };
    }

    const tags = await Tag.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Tag.countDocuments(searchQuery);

    res.json({
      tags,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error searching tags:", error);
    throw error;
  }
};

export const searchCategories = async (req, res) => {
  try {
    const { query, sort = "name", page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {};
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "name":
        sortOptions = { name: 1 };
        break;
      case "posts":
        sortOptions = { postCount: -1 };
        break;
      default:
        sortOptions = { name: 1 };
    }

    const categories = await Category.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(searchQuery);

    res.json({
      categories,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error searching categories:", error);
    throw error;
  }
};

// Discovery Controllers
export const getTrendingPosts = async (req, res) => {
  try {
    const { timeFrame = "week", limit = 10 } = req.query;

    const timeFrameDate = new Date();
    switch (timeFrame) {
      case "day":
        timeFrameDate.setDate(timeFrameDate.getDate() - 1);
        break;
      case "week":
        timeFrameDate.setDate(timeFrameDate.getDate() - 7);
        break;
      case "month":
        timeFrameDate.setMonth(timeFrameDate.getMonth() - 1);
        break;
      default:
        timeFrameDate.setDate(timeFrameDate.getDate() - 7);
    }

    const posts = await Post.find({
      createdAt: { $gte: timeFrameDate }
    })
      .sort({ 
        score: {
          $function: {
            body: function(views, votes, comments) {
              return (views * 0.3) + (votes * 0.5) + (comments * 0.2);
            },
            args: ["$views", "$votes", "$commentCount"],
            lang: "js"
          }
        }
      })
      .limit(limit)
      .populate("author", "username avatar")
      .populate("category", "name")
      .populate("tags", "name");

    res.json(posts);
  } catch (error) {
    logger.error("Error getting trending posts:", error);
    throw error;
  }
};

export const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Tag.find()
      .sort({ postCount: -1 })
      .limit(limit);

    res.json(tags);
  } catch (error) {
    logger.error("Error getting popular tags:", error);
    throw error;
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const { timeFrame = "week", limit = 10 } = req.query;

    const timeFrameDate = new Date();
    switch (timeFrame) {
      case "day":
        timeFrameDate.setDate(timeFrameDate.getDate() - 1);
        break;
      case "week":
        timeFrameDate.setDate(timeFrameDate.getDate() - 7);
        break;
      case "month":
        timeFrameDate.setMonth(timeFrameDate.getMonth() - 1);
        break;
      default:
        timeFrameDate.setDate(timeFrameDate.getDate() - 7);
    }

    const users = await User.find({
      lastActive: { $gte: timeFrameDate }
    })
      .sort({ 
        activityScore: {
          $function: {
            body: function(posts, comments, votes) {
              return (posts * 0.5) + (comments * 0.3) + (votes * 0.2);
            },
            args: ["$postCount", "$commentCount", "$voteCount"],
            lang: "js"
          }
        }
      })
      .limit(limit)
      .select("username avatar reputation postCount commentCount voteCount");

    res.json(users);
  } catch (error) {
    logger.error("Error getting active users:", error);
    throw error;
  }
};

export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const post = await Post.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Find posts with similar tags or in the same category
    const relatedPosts = await Post.find({
      _id: { $ne: id },
      $or: [
        { tags: { $in: post.tags } },
        { category: post.category }
      ]
    })
      .sort({ 
        relevance: {
          $function: {
            body: function(tags, category) {
              const tagMatch = tags.filter(t => post.tags.includes(t)).length;
              const categoryMatch = category === post.category ? 1 : 0;
              return (tagMatch * 0.7) + (categoryMatch * 0.3);
            },
            args: ["$tags", "$category"],
            lang: "js"
          }
        }
      })
      .limit(limit)
      .populate("author", "username avatar")
      .populate("category", "name")
      .populate("tags", "name");

    res.json(relatedPosts);
  } catch (error) {
    logger.error("Error getting related posts:", error);
    throw error;
  }
}; 