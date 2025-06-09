import Message from "../models/Message.js";
import { logger } from "../utils/logger.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, type, attachments } = req.body;
    const userId = req.user.id;

    const message = new Message({
      sender: userId,
      recipient: recipientId,
      content,
      type,
      attachments,
    });

    await message.save();
    logger.info(`Message sent: ${message._id}`);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error sending message",
    });
  }
};

// Get conversation with a user
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.findConversation(currentUserId, userId);
    logger.info(`Retrieved conversation between users: ${currentUserId} and ${userId}`);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error(`Error getting conversation: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting conversation",
    });
  }
};

// Get unread messages
export const getUnreadMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findUnread(userId);
    logger.info(`Retrieved unread messages for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error(`Error getting unread messages: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting unread messages",
    });
  }
};

// Get sent messages
export const getSentMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findSent(userId);
    logger.info(`Retrieved sent messages for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error(`Error getting sent messages: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting sent messages",
    });
  }
};

// Get received messages
export const getReceivedMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findReceived(userId);
    logger.info(`Retrieved received messages for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error(`Error getting received messages: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error getting received messages",
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to mark this message as read",
      });
    }

    await message.markAsRead();
    logger.info(`Marked message as read: ${id}`);

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error(`Error marking message as read: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error marking message as read",
    });
  }
};

// Mark message as unread
export const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to mark this message as unread",
      });
    }

    await message.markAsUnread();
    logger.info(`Marked message as unread: ${id}`);

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error(`Error marking message as unread: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error marking message as unread",
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Check if user is the sender or recipient
    if (
      message.sender.toString() !== userId &&
      message.recipient.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this message",
      });
    }

    await message.softDelete();
    logger.info(`Deleted message: ${id}`);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error(`Error deleting message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error deleting message",
    });
  }
}; 