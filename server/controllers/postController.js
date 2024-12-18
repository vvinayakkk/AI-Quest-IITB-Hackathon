import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Users from "../models/users.js";
import EmailService from "../services/mailService.js";
import axios from "axios";

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
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;

    const { title, content, tags = [], images = [] } = req.body;

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
    });

    await Users.findByIdAndUpdate(userId, { $push: { posts: post._id } }, { new: true });

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
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
      error: process.env.NODE_ENV === "development" ? error.stack : {},
    });
  }
};

/**
 * Retrieves a single post and increments view count
 * @route GET /post/:id
 */
const getPost = async (req, res) => {
  try {
    const post = await findPostById(req.params.id);

    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves all posts with optional search functionality
 * @route GET /post
 */
const getPosts = async (req, res) => {
  try {
    const { search = "" } = req.query;

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
    const posts = await Post.find(query)
      .populate("author", "firstName lastName fullName avatar email verified department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Toggles like status for a post
 * @route PUT /post/:id/like
 */
const toggleLike = async (req, res) => {
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Adds a new comment to a post
 * @route POST /post/:id/comment
 */
const addComment = async (req, res) => {
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

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Deletes a post
 * @route DELETE /post/:id
 */
const deletePost = async (req, res) => {
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

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Deletes a comment and all its nested replies
 * @route DELETE /post/comment/:id
 */
const deleteComment = async (req, res) => {
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

    res.json({
      success: true,
      message: "Comment and all replies deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { createPost, getPosts, getPost, toggleLike, addComment, deletePost, deleteComment };
