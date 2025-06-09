import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { clearPostCache, clearUserCache } from '../services/cacheService.js';
import logger from '../utils/logger.js';

/**
 * Toggles upvote on a comment
 * @route POST /post/comment/:id/upvote
 */
const toggleUpvote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;
    const user = await User.findById(userId);
    const comment = await Comment.findById(req.params.id);
    const author = await User.findById(comment.author._id);
    const post = await Post.findById(postId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const upvoteIndex = comment.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      comment.upvotes.push(userId);
    }

    await comment.save();

    if (author._id.toString() !== userId) {
      author.notifications.push({
        type: "upvote",
        message: `${user.fullName} liked your comment on post "${post.title}"`,
        link: `/post/${post._id}`,
      });
      await author.save();
    }

    res.json({
      success: true,
      data: {
        upvotes: comment.upvotes.length,
        isUpvoted: upvoteIndex === -1,
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
 * Adds a reply to a comment
 * @route POST /post/comment/:id/reply
 */
const addReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, postId } = req.body;
    const user = await User.findById(userId);
    const parentComment = await Comment.findById(req.params.id);
    const author = await User.findById(parentComment.author._id);
    const post = await Post.findById(postId);

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    const reply = await Comment.create({
      author: userId,
      content,
      type: "user",
    });

    parentComment.replies.push(reply._id);
    await parentComment.save();

    if (author._id.toString() !== userId) {
      author.notifications.push({
        type: "reply",
        message: `${user.fullName} replied to your comment on post "${post.title}"`,
        link: `/post/${post._id}`,
      });
      await author.save();
    }

    // Populate author details
    await reply.populate("author", "firstName lastName avatar email verified department");

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Deletes a reply from a comment
 * @route DELETE /post/comment/:commentId/reply/:replyId
 */
const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    const reply = await Comment.findById(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    const canDelete = reply.author._id.toString() === userId || (user && ["Admin", "Moderator"].includes(user.role));

    // Check if user is authorized to delete the reply
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reply",
      });
    }

    // Remove reply from parent comment's replies array
    parentComment.replies = parentComment.replies.filter((id) => id.toString() !== replyId);
    await parentComment.save();

    // Delete the reply document
    await Comment.findByIdAndDelete(replyId);

    res.json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark a comment as correct
 * @route POST /post/comment/:id/correct
 */
const markCorrectComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.id;

    // Check if user is admin or moderator
    const user = await User.findById(userId);
    if (!["Admin", "Moderator"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark comments as correct",
      });
    }

    // Find and update the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Update comment type
    if (comment.type !== "correct") comment.type = "correct";
    else comment.type = "user";
    await comment.save();

    res.json({
      success: true,
      data: comment,
      message: "Comment marked as correct successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new comment
export const createComment = async (req, res, next) => {
  try {
    const { content, postId, parentId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // If this is a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }
    }

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
      parent: parentId
    });

    await comment.save();

    // Update post's comment count
    post.comments.push(comment._id);
    await post.save();

    // Clear caches
    await clearPostCache(postId);
    if (parentId) {
      await clearPostCache(parentId);
    }

    // Notify post author if it's not their comment
    if (post.author.toString() !== userId) {
      const author = await User.findById(post.author);
      if (author) {
        await sendNotificationEmail(
          author.email,
          'New Comment',
          `Your post "${post.title}" received a new comment!`
        );
      }
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Get a single comment
export const getComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('post', 'title');

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    // Clear caches
    await clearPostCache(comment.post);
    if (comment.parent) {
      await clearPostCache(comment.parent);
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    // Delete all replies
    await Comment.deleteMany({ parent: comment._id });

    // Delete the comment
    await comment.remove();

    // Clear caches
    await clearPostCache(comment.post);
    if (comment.parent) {
      await clearPostCache(comment.parent);
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get comment replies
export const getCommentReplies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({ parent: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ parent: req.params.id });

    res.json({
      success: true,
      data: replies,
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

// Vote on a comment
export const voteComment = async (req, res, next) => {
  try {
    const { vote } = req.body;
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const existingVote = comment.votes.find(v => v.user.toString() === userId);
    if (existingVote) {
      if (existingVote.value === vote) {
        comment.votes = comment.votes.filter(v => v.user.toString() !== userId);
      } else {
        existingVote.value = vote;
      }
    } else {
      comment.votes.push({ user: userId, value: vote });
    }

    comment.score = comment.votes.reduce((acc, vote) => acc + vote.value, 0);
    await comment.save();

    // Clear caches
    await clearPostCache(comment.post);
    if (comment.parent) {
      await clearPostCache(comment.parent);
    }

    // Notify comment author if it's an upvote
    if (vote === 1 && comment.author.toString() !== userId) {
      const author = await User.findById(comment.author);
      if (author) {
        await sendNotificationEmail(
          author.email,
          'New Upvote',
          'Your comment received an upvote!'
        );
      }
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Mark comment as answer
export const markAsAnswer = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const post = await Post.findById(comment.post);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Only post author can mark answers
    if (post.author.toString() !== userId) {
      throw new UnauthorizedError('Only post author can mark answers');
    }

    // If there's already an accepted answer, unmark it
    if (post.acceptedAnswer) {
      const previousAnswer = await Comment.findById(post.acceptedAnswer);
      if (previousAnswer) {
        previousAnswer.isAnswer = false;
        await previousAnswer.save();
      }
    }

    // Mark new answer
    comment.isAnswer = true;
    post.acceptedAnswer = commentId;
    await Promise.all([comment.save(), post.save()]);

    // Clear caches
    await clearPostCache(post._id);

    // Notify comment author
    const author = await User.findById(comment.author);
    if (author) {
      await sendNotificationEmail(
        author.email,
        'Answer Accepted',
        'Your comment was marked as the accepted answer!'
      );
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Report a comment
export const reportComment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const existingReport = comment.reports.find(r => r.user.toString() === userId);
    if (existingReport) {
      throw new ValidationError('You have already reported this comment');
    }

    comment.reports.push({ user: userId, reason });
    await comment.save();

    // Clear caches
    await clearPostCache(comment.post);
    if (comment.parent) {
      await clearPostCache(comment.parent);
    }

    // Notify moderators
    const moderators = await User.find({ role: 'moderator' });
    for (const moderator of moderators) {
      await sendNotificationEmail(
        moderator.email,
        'New Comment Report',
        `A comment has been reported for: ${reason}`
      );
    }

    res.json({
      success: true,
      message: 'Comment reported successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get comment statistics
export const getCommentStats = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const stats = {
      votes: comment.votes.length,
      score: comment.score,
      replies: await Comment.countDocuments({ parent: comment._id }),
      reports: comment.reports.length,
      isAnswer: comment.isAnswer
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export { toggleUpvote, addReply, deleteReply, markCorrectComment };
