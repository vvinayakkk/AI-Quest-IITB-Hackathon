import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Users from "../models/users.js";

/**
 * Helper function to find and populate a post by ID
 * @param {string} id - Post ID
 * @returns {Promise<Post>} Populated post object
 */
const findPostById = async (id) => {
  const post = await Post.findById(id)
    .populate("author", "firstName lastName fullName avatar email verified department")
    .populate({
      path: "comments",
      populate: [
        {
          path: "author",
          select: "firstName lastName fullName avatar email verified department",
        },
        {
          path: "replies",
          populate: {
            path: "author",
            select: "firstName lastName fullName avatar email verified department",
          },
        },
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

    // Populate author details
    await post.populate({
      path: "author",
      select: "firstName lastName fullName avatar email verified department",
    });

    res.status(201).json({
      success: true,
      data: post,
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

    // Check if user has already liked the post
    const isLiked = post.likes.some((like) => like.toString() === userId.toString());

    if (isLiked) post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
    else post.likes.push(userId);

    await post.save();

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

    // Create new comment document
    const comment = await Comment.create({
      author: userId,
      content,
    });

    post.comments.push(comment._id);
    await post.save();

    // Populate the comment's author details
    await comment.populate({
      path: "author",
      select: "firstName lastName fullName avatar email verified department",
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
    const canDelete = post.author._id.toString() === userId || 
                     (user && ["Admin", "Moderator"].includes(user.role));

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

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

    // Check if user is comment author or has admin/moderator privileges
    const canDelete = comment.author._id.toString() === userId || 
                     (user && ["Admin", "Moderator"].includes(user.role));

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Recursive function to collect all nested reply IDs
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

    const replyIds = await getAllNestedReplies(comment.replies);
    if (replyIds.length > 0) await Comment.deleteMany({ _id: { $in: replyIds } });

    // Delete the main comment
    await Comment.findByIdAndDelete(commentId);

    // Find and update the post that contains this comment
    await Post.findOneAndUpdate({ comments: { $elemMatch: { $eq: commentId } } }, { $pull: { comments: commentId } });

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
