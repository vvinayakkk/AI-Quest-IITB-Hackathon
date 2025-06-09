import { Post, User, Category, Tag, Comment, Report } from "../models/index.js";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";

// Post Analytics
export const getPostAnalytics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      totalPosts,
      activePosts,
      postsByCategory,
      postsByTag,
      postsByStatus,
      topPosts,
      postTrends
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: "active" }),
      Post.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      Post.aggregate([
        { $match: dateFilter },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } }
      ]),
      Post.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Post.find(dateFilter)
        .sort({ views: -1, score: -1 })
        .limit(10)
        .populate("author", "username"),
      Post.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalPosts,
      activePosts,
      postsByCategory,
      postsByTag,
      postsByStatus,
      topPosts,
      postTrends
    });
  } catch (error) {
    logger.error("Error getting post analytics:", error);
    throw error;
  }
};

// User Analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      topContributors,
      userActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ createdAt: dateFilter }),
      User.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      User.find(dateFilter)
        .sort({ reputation: -1 })
        .limit(10)
        .select("username reputation"),
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      topContributors,
      userActivity
    });
  } catch (error) {
    logger.error("Error getting user analytics:", error);
    throw error;
  }
};

// Category Analytics
export const getCategoryAnalytics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      totalCategories,
      activeCategories,
      postsByCategory,
      topCategories,
      categoryGrowth
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ status: "active" }),
      Post.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      Category.find()
        .sort({ postCount: -1 })
        .limit(10)
        .populate("moderators", "username"),
      Category.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalCategories,
      activeCategories,
      postsByCategory,
      topCategories,
      categoryGrowth
    });
  } catch (error) {
    logger.error("Error getting category analytics:", error);
    throw error;
  }
};

// Tag Analytics
export const getTagAnalytics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      totalTags,
      activeTags,
      postsByTag,
      topTags,
      tagTrends
    ] = await Promise.all([
      Tag.countDocuments(),
      Tag.countDocuments({ status: "active" }),
      Post.aggregate([
        { $match: dateFilter },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } }
      ]),
      Tag.find()
        .sort({ postCount: -1 })
        .limit(10),
      Tag.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalTags,
      activeTags,
      postsByTag,
      topTags,
      tagTrends
    });
  } catch (error) {
    logger.error("Error getting tag analytics:", error);
    throw error;
  }
};

// Platform Statistics
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalPosts,
      totalUsers,
      totalComments,
      totalCategories,
      totalTags,
      totalReports,
      activeUsers,
      activePosts
    ] = await Promise.all([
      Post.countDocuments(),
      User.countDocuments(),
      Comment.countDocuments(),
      Category.countDocuments(),
      Tag.countDocuments(),
      Report.countDocuments(),
      User.countDocuments({ status: "active" }),
      Post.countDocuments({ status: "active" })
    ]);

    res.json({
      totalPosts,
      totalUsers,
      totalComments,
      totalCategories,
      totalTags,
      totalReports,
      activeUsers,
      activePosts,
      averagePostsPerUser: totalPosts / totalUsers,
      averageCommentsPerPost: totalComments / totalPosts
    });
  } catch (error) {
    logger.error("Error getting platform stats:", error);
    throw error;
  }
};

// Engagement Metrics
export const getEngagementMetrics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      averageResponseTime,
      userEngagement
    ] = await Promise.all([
      Post.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: "$views" } } }
      ]),
      Post.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: "$likes" } } }
      ]),
      Comment.countDocuments(dateFilter),
      Post.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: "$shares" } } }
      ]),
      Comment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            avgTime: { $avg: { $subtract: ["$createdAt", "$post.createdAt"] } }
          }
        }
      ]),
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$_id",
            postCount: { $sum: 1 },
            commentCount: { $sum: 1 },
            likeCount: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments,
      totalShares: totalShares[0]?.total || 0,
      averageResponseTime: averageResponseTime[0]?.avgTime || 0,
      userEngagement
    });
  } catch (error) {
    logger.error("Error getting engagement metrics:", error);
    throw error;
  }
};

// Growth Metrics
export const getGrowthMetrics = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      newUsers,
      newPosts,
      newComments,
      userRetention,
      postGrowth,
      commentGrowth
    ] = await Promise.all([
      User.countDocuments(dateFilter),
      Post.countDocuments(dateFilter),
      Comment.countDocuments(dateFilter),
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Post.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Comment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      newUsers,
      newPosts,
      newComments,
      userRetention,
      postGrowth,
      commentGrowth
    });
  } catch (error) {
    logger.error("Error getting growth metrics:", error);
    throw error;
  }
};

// Moderation Statistics
export const getModerationStats = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const dateFilter = getDateFilter(timeRange);

    const [
      totalReports,
      reportsByType,
      reportsByStatus,
      resolvedReports,
      averageResolutionTime,
      moderatorActivity
    ] = await Promise.all([
      Report.countDocuments(dateFilter),
      Report.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Report.countDocuments({ ...dateFilter, status: "resolved" }),
      Report.aggregate([
        { $match: { ...dateFilter, status: "resolved" } },
        {
          $group: {
            _id: null,
            avgTime: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } }
          }
        }
      ]),
      Report.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$moderator",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalReports,
      reportsByType,
      reportsByStatus,
      resolvedReports,
      averageResolutionTime: averageResolutionTime[0]?.avgTime || 0,
      moderatorActivity
    });
  } catch (error) {
    logger.error("Error getting moderation stats:", error);
    throw error;
  }
};

// Helper function to get date filter based on time range
const getDateFilter = (timeRange) => {
  const now = new Date();
  let startDate;

  switch (timeRange) {
    case "24h":
      startDate = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
  }

  return { createdAt: { $gte: startDate } };
}; 