import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Users from "../models/users.js";
import EmailService from "../services/mailService.js";
import axios from "axios";
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { clearPostCache, clearUserCache } from '../services/cacheService.js';
import logger from '../utils/logger.js';

/**
 * Creates a recursive populate object with depth limit
 * @param {number} maxDepth Maximum depth to populate
 * @returns {Object} Mongoose populate configuration
 */
const createPopulateObject = (maxDepth = 10) => {
  const authorSelect = "firstName lastName fullName avatar email verified department";

  const populateReplies = (depth = 0) => {
    if (depth >= maxDepth) return null;

    return {
      path: "replies",
      options: { sort: { createdAt: -1 } },
      populate: [
        {
          path: "author",
          select: authorSelect,
        },
        populateReplies(depth + 1),
      ].filter(Boolean),
    };
  };

  return populateReplies();
};

const findPostById = async (id) => {
  const post = await Post.findById(id)
    .populate("author", "firstName lastName fullName avatar email verified department")
    .populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: [
        {
          path: "author",
          select: "firstName lastName fullName avatar email verified department",
        },
        createPopulateObject(),
      ],
    });

  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};

/**
 * Creates a new post with images and tags
 * @route POST /post
 */
const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { title, content, tags = [], images = [], category } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Generate unique IDs for uploaded images
    const processedImages = images.map((image) => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: image.data || null,
      uploadedAt: new Date(),
    }));

    const post = await Post.create({
      title,
      content,
      tags,
      images: processedImages,
      author: userId,
      likes: [],
      comments: [],
      views: 0,
      category,
    });

    await Users.findByIdAndUpdate(userId, { $push: { posts: post._id } }, { new: true });
    await clearUserCache(userId);

    const response = await axios.post("http://127.0.0.1:8000/api/gemini-answer/", {
      heading: title,
      postContent: content,
    });

    const comment = await Comment.create({
      author: "6762992a111a1def3c125264",
      content: response.data.answer,
      type: "ai"
    });

    // Add comment to post and user
    post.comments.push(comment._id);
    await post.save();

    await Users.findByIdAndUpdate("6762992a111a1def3c125264", { $push: { comments: comment._id } });

    // Replace the problematic populate chain with proper population
    const populatedPost = await Post.findById(post._id)
      .populate({
        path: "author",
        select: "firstName lastName fullName avatar email verified department",
      })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: "author",
            select: "firstName lastName fullName avatar email verified department",
          },
          createPopulateObject(),
        ],
      });

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    console.error("Post creation error:", error);
    next(error);
  }
};

/**
 * Retrieves a single post and increments view count
 * @route GET /post/:id
 */
const getPost = async (req, res, next) => {
  try {
    const post = await findPostById(req.params.id);

    post.views += 1;
    await post.save();
    await clearPostCache(req.params.id);

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all posts with optional search functionality
 * @route GET /post
 */
const getPosts = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    // Build search query using regex for flexible matching
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Fetch posts
    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate("author", "firstName lastName fullName avatar email verified department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    next(error);
  }
};

/**
 * Toggles like status for a post
 * @route PUT /post/:id/like
 */
const toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const post = await findPostById(req.params.id);
    const user = await Users.findById(userId);
    const author = await Users.findById(post.author._id);

    // Check if user has already liked the post
    const isLiked = post.likes.some((like) => like.toString() === userId.toString());

    if (isLiked) post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
    else {
      // Notify post author if user is not the author
      if (author._id.toString() !== userId) {
        author.notifications.push({
          type: "upvote",
          message: `${user.fullName} liked your post "${post.title}"`,
          link: `http://localhost:5173/post/${post._id}`,
        });
        await author.save();
      }
      post.likes.push(userId);
    }

    await post.save();
    await clearPostCache(req.params.id);

    await EmailService.sendNotificationEmail({
      to: author.email,
      userName: author.fullName,
      notificationType: "upvote",
      message: `${user.fullName} liked your post "${post.title}"`,
      link: `http://localhost:5173/post/${post._id}`,
      // logoPath: '../server/assets/logo.png' // Path to your logo
    });

    res.json({
      success: true,
      data: {
        likes: post.likes.length,
        isLiked: !isLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Adds a new comment to a post
 * @route POST /post/:id/comment
 */
const addComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await findPostById(req.params.id);
    const author = await Users.findById(post.author._id);
    const user = await Users.findById(userId);

    // Create new comment document
    const comment = await Comment.create({
      author: userId,
      content,
    });

    // Add comment to post and user
    post.comments.push(comment._id);
    await post.save();

    await Users.findByIdAndUpdate(userId, { $push: { comments: comment._id } });

    if (author._id.toString() !== userId) {
      author.notifications.push({
        type: "comment",
        message: `${user.fullName} commented your post "${post.title}"`,
        link: `/post/${post._id}`,
      });
      await author.save();
    }

    // Populate the comment's author details
    await comment.populate({
      path: "author",
      select: "firstName lastName fullName avatar email verified department",
    });

    await EmailService.sendNotificationEmail({
      to: author.email,
      userName: author.fullName,
      notificationType: "comment",
      message: `${user.fullName} liked your post "${post.title}"`,
      link: `http://localhost:5173/post/${post._id}`,
      logoPath: "../../client/public/logo.png", // Path to your logo
    });

    await clearPostCache(req.params.id);

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a post
 * @route DELETE /post/:id
 */
const deletePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);

    const post = await findPostById(req.params.id);

    // Check if user is post author or has admin/moderator privileges
    const canDelete = post.author._id.toString() === userId || (user && ["Admin", "Moderator"].includes(user.role));

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await Users.findByIdAndUpdate(post.author._id, { $pull: { posts: post._id } });

    await Post.findByIdAndDelete(req.params.id);
    await clearPostCache(req.params.id);
    await clearUserCache(post.author);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a comment and all its nested replies
 * @route DELETE /post/comment/:id
 */
const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate("author", "firstName lastName");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const canDelete = comment.author._id.toString() === userId || (user && ["Admin", "Moderator"].includes(user.role));

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    const getAllNestedReplies = async (replyIds) => {
      let allReplies = [...replyIds];
      for (const replyId of replyIds) {
        const reply = await Comment.findById(replyId);
        if (reply && reply.replies.length > 0) {
          const nestedReplies = await getAllNestedReplies(reply.replies);
          allReplies = [...allReplies, ...nestedReplies];
        }
      }
      return allReplies;
    };

    // Get all nested reply IDs
    const replyIds = await getAllNestedReplies(comment.replies);
    const allCommentIds = [commentId, ...replyIds];

    // Get all comments including main comment and replies
    const allComments = await Comment.find({ _id: { $in: allCommentIds } });

    // Group comments by author ID for efficient updates
    const commentsByAuthor = allComments.reduce((acc, comment) => {
      const authorId = comment.author.toString();
      if (!acc[authorId]) acc[authorId] = [];
      acc[authorId].push(comment._id);
      return acc;
    }, {});

    // Update all affected users' comment arrays
    const userUpdates = Object.entries(commentsByAuthor).map(([authorId, commentIds]) =>
      Users.findByIdAndUpdate(authorId, { $pull: { comments: { $in: commentIds } } })
    );

    await Promise.all([
      ...userUpdates,
      Comment.deleteMany({ _id: { $in: allCommentIds } }),
      Post.findOneAndUpdate({ comments: { $elemMatch: { $eq: commentId } } }, { $pull: { comments: { $in: allCommentIds } } }),
    ]);

    await clearPostCache(req.params.id);

    res.json({
      success: true,
      message: "Comment and all replies deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update a post
const updatePost = async (req, res, next) => {
  try {
    const { title, content, tags, category } = req.body;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.category = category || post.category;
    post.updatedAt = Date.now();

    await post.save();
    await clearPostCache(postId);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Search posts
const searchPosts = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };

    const posts = await Post.find(searchQuery)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(searchQuery);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get trending posts
const getTrendingPosts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const posts = await Post.find()
      .populate('author', 'name avatar')
      .sort({ score: -1, views: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// Get posts by tag
const getPostsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ tags: tag })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ tags: tag });

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get posts by category
const getPostsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ category })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ category });

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get posts by user
const getPostsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ author: userId });

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Vote on a post
const votePost = async (req, res, next) => {
  try {
    const { vote } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingVote = post.votes.find(v => v.user.toString() === userId);
    if (existingVote) {
      if (existingVote.value === vote) {
        post.votes = post.votes.filter(v => v.user.toString() !== userId);
      } else {
        existingVote.value = vote;
      }
    } else {
      post.votes.push({ user: userId, value: vote });
    }

    post.score = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    await post.save();
    await clearPostCache(postId);

    // Notify post author if it's an upvote
    if (vote === 1 && post.author.toString() !== userId) {
      const author = await Users.findById(post.author._id);
      if (author) {
        await sendNotificationEmail(
          author.email,
          'New Upvote',
          `Your post "${post.title}" received an upvote!`
        );
      }
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Bookmark a post
const bookmarkPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const user = await Users.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const bookmarkIndex = user.bookmarks.indexOf(postId);
    if (bookmarkIndex === -1) {
      user.bookmarks.push(postId);
    } else {
      user.bookmarks.splice(bookmarkIndex, 1);
    }

    await user.save();
    await clearUserCache(userId);

    res.json({
      success: true,
      data: {
        bookmarked: bookmarkIndex === -1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Report a post
const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingReport = post.reports.find(r => r.user.toString() === userId);
    if (existingReport) {
      throw new ValidationError('You have already reported this post');
    }

    post.reports.push({ user: userId, reason });
    await post.save();
    await clearPostCache(postId);

    // Notify moderators
    const moderators = await Users.find({ role: 'moderator' });
    for (const moderator of moderators) {
      await sendNotificationEmail(
        moderator.email,
        'New Post Report',
        `A post has been reported for: ${reason}`
      );
    }

    res.json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get post statistics
const getPostStats = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const stats = {
      views: post.views,
      votes: post.votes.length,
      score: post.score,
      comments: post.comments.length,
      bookmarks: (await Users.countDocuments({ bookmarks: post._id })),
      reports: post.reports.length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export { createPost, getPosts, getPost, toggleLike, addComment, deletePost, deleteComment, updatePost, searchPosts, getTrendingPosts, getPostsByTag, getPostsByCategory, getPostsByUser, votePost, bookmarkPost, reportPost, getPostStats };
