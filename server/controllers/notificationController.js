import { Notification, Message, User } from "../models/index.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { sendNotificationEmail } from "../services/emailService.js";
import { clearCacheByPattern } from "../services/cacheService.js";

// Notification Controllers
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar")
      .populate("post", "title")
      .populate("comment", "content");

    const total = await Notification.countDocuments({ recipient: req.user.id });

    res.json({
      notifications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error getting notifications:", error);
    throw error;
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    await clearCacheByPattern(`notifications:${req.user.id}:*`);

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    await clearCacheByPattern(`notifications:${req.user.id}:*`);

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    await clearCacheByPattern(`notifications:${req.user.id}:*`);

    res.json({ message: "Notification deleted" });
  } catch (error) {
    logger.error("Error deleting notification:", error);
    throw error;
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    logger.error("Error getting unread count:", error);
    throw error;
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notificationPreferences");
    res.json(user.notificationPreferences);
  } catch (error) {
    logger.error("Error getting notification preferences:", error);
    throw error;
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences: preferences },
      { new: true }
    ).select("notificationPreferences");

    await clearCacheByPattern(`notifications:${req.user.id}:*`);

    res.json(user.notificationPreferences);
  } catch (error) {
    logger.error("Error updating notification preferences:", error);
    throw error;
  }
};

// Message Controllers
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw new NotFoundError("Recipient not found");
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content
    });

    await message.populate("sender", "username avatar");
    await message.populate("recipient", "username avatar");

    // Create notification for recipient
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: "message",
      message: message._id
    });

    // Send email notification if enabled
    if (recipient.notificationPreferences?.email?.messages) {
      await sendNotificationEmail({
        to: recipient.email,
        type: "message",
        data: {
          userName: recipient.username,
          senderName: req.user.username,
          message: content
        }
      });
    }

    await clearCacheByPattern(`messages:${req.user.id}:*`);
    await clearCacheByPattern(`messages:${recipientId}:*`);

    res.status(201).json(message);
  } catch (error) {
    logger.error("Error sending message:", error);
    throw error;
  }
};

export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar");

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    });

    res.json({
      messages,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error getting messages:", error);
    throw error;
  }
};

export const getConversation = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar");

    const total = await Message.countDocuments({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    });

    res.json({
      messages,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error getting conversation:", error);
    throw error;
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    await clearCacheByPattern(`messages:${req.user.id}:*`);

    res.json({ message: "Message marked as read" });
  } catch (error) {
    logger.error("Error marking message as read:", error);
    throw error;
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    });

    if (!message) {
      throw new NotFoundError("Message not found");
    }

    await clearCacheByPattern(`messages:${req.user.id}:*`);
    if (message.recipient.toString() !== req.user.id) {
      await clearCacheByPattern(`messages:${message.recipient}:*`);
    }

    res.json({ message: "Message deleted" });
  } catch (error) {
    logger.error("Error deleting message:", error);
    throw error;
  }
};

export const getUnreadMessagesCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    logger.error("Error getting unread messages count:", error);
    throw error;
  }
}; 