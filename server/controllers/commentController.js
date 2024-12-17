import Comment from "../models/comment.js";

/**
 * Toggles upvote on a comment
 * @route POST /comment/:id/upvote
 */
const toggleUpvote = async (req, res) => {
  try {
    const userId = req.user.id;
    const comment = await Comment.findById(req.params.id);

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
 * @route POST /comment/:id/reply
 */
const addReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    const parentComment = await Comment.findById(req.params.id);

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
 * @route DELETE /comment/:commentId/reply/:replyId
 */
const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.id;

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

    // Check if user is authorized to delete the reply
    if (reply.author.toString() !== userId) {
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

export { toggleUpvote, addReply, deleteReply };
