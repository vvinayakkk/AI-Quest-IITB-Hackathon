import Comment from "../models/comment.js";
import Posts from "../models/post.js";
import Users from "../models/users.js";

/**
 * Toggles upvote on a comment
 * @route POST /post/comment/:id/upvote
 */
const toggleUpvote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;
    const user = await Users.findById(userId);
    const comment = await Comment.findById(req.params.id);
    const author = await Users.findById(comment.author._id);
    const post = await Posts.findById(postId);

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
    const user = await Users.findById(userId);
    const parentComment = await Comment.findById(req.params.id);
    const author = await Users.findById(parentComment.author._id);
    const post = await Posts.findById(postId);

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
    const user = await Users.findById(userId);

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
    const user = await Users.findById(userId);
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

export { toggleUpvote, addReply, deleteReply, markCorrectComment };
