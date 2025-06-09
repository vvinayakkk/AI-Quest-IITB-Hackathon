import { Report } from '../models/Report.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { clearPostCache, clearUserCache } from '../services/cacheService.js';
import logger from '../utils/logger.js';
import os from 'os';

// Get all reports
export const getReports = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
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

// Handle a report
export const handleReport = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const reportId = req.params.id;
    const moderatorId = req.user.id;

    const report = await Report.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    report.status = 'resolved';
    report.resolution = {
      action,
      reason,
      moderator: moderatorId,
      resolvedAt: Date.now()
    };

    await report.save();

    // Take action based on moderator's decision
    switch (action) {
      case 'delete':
        if (report.type === 'post') {
          await Post.findByIdAndDelete(report.content);
        } else if (report.type === 'comment') {
          await Comment.findByIdAndDelete(report.content);
        }
        break;
      case 'warn':
        const user = await User.findById(report.reporter);
        if (user) {
          user.warnings.push({
            reason,
            moderator: moderatorId,
            date: Date.now()
          });
          await user.save();
          await sendNotificationEmail(
            user.email,
            'Warning Issued',
            `You have received a warning: ${reason}`
          );
        }
        break;
      case 'ban':
        await banUser(req, res, next);
        break;
    }

    // Notify reporter
    const reporter = await User.findById(report.reporter);
    if (reporter) {
      await sendNotificationEmail(
        reporter.email,
        'Report Resolved',
        `Your report has been resolved with action: ${action}`
      );
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Get moderation queue
export const getModerationQueue = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const queue = await Report.find({ status: 'pending' })
      .populate('reporter', 'name email')
      .populate('content')
      .sort({ priority: -1, createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: queue,
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

// Get moderation statistics
export const getModerationStats = async (req, res, next) => {
  try {
    const stats = {
      totalReports: await Report.countDocuments(),
      pendingReports: await Report.countDocuments({ status: 'pending' }),
      resolvedReports: await Report.countDocuments({ status: 'resolved' }),
      reportsByType: await Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      reportsByStatus: await Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      recentActions: await Report.find()
        .sort({ 'resolution.resolvedAt': -1 })
        .limit(5)
        .populate('resolution.moderator', 'name')
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Get moderation logs
export const getModerationLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await Report.find({ 'resolution.moderator': { $exists: true } })
      .populate('resolution.moderator', 'name')
      .sort({ 'resolution.resolvedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments({ 'resolution.moderator': { $exists: true } });

    res.json({
      success: true,
      data: logs,
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

// Ban a user
export const banUser = async (req, res, next) => {
  try {
    const { reason, duration } = req.body;
    const userId = req.params.id;
    const moderatorId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.banned = {
      isBanned: true,
      reason,
      moderator: moderatorId,
      bannedAt: Date.now(),
      expiresAt: duration ? Date.now() + duration : null
    };

    await user.save();
    await clearUserCache(userId);

    // Notify user
    await sendNotificationEmail(
      user.email,
      'Account Banned',
      `Your account has been banned. Reason: ${reason}`
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Unban a user
export const unbanUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const moderatorId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.banned = {
      isBanned: false,
      unbannedAt: Date.now(),
      unbannedBy: moderatorId
    };

    await user.save();
    await clearUserCache(userId);

    // Notify user
    await sendNotificationEmail(
      user.email,
      'Account Unbanned',
      'Your account has been unbanned. You can now access the platform again.'
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get banned users
export const getBannedUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({ 'banned.isBanned': true })
      .select('name email banned')
      .sort({ 'banned.bannedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ 'banned.isBanned': true });

    res.json({
      success: true,
      data: users,
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

// Get admin statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ lastLogin: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 } }),
        banned: await User.countDocuments({ 'banned.isBanned': true })
      },
      content: {
        posts: await Post.countDocuments(),
        comments: await Comment.countDocuments(),
        reports: await Report.countDocuments()
      },
      moderation: {
        pendingReports: await Report.countDocuments({ status: 'pending' }),
        resolvedReports: await Report.countDocuments({ status: 'resolved' })
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.cpus()
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Get system logs
export const getSystemLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await logger.getLogs()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await logger.getLogCount();

    res.json({
      success: true,
      data: logs,
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

// Get audit logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await logger.getAuditLogs()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await logger.getAuditLogCount();

    res.json({
      success: true,
      data: logs,
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

// Update system settings
export const updateSystemSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    const adminId = req.user.id;

    const systemSettings = await SystemSettings.findOne() || new SystemSettings();
    Object.assign(systemSettings, settings);
    systemSettings.lastUpdatedBy = adminId;
    systemSettings.lastUpdatedAt = Date.now();

    await systemSettings.save();

    // Log the change
    await logger.audit('System settings updated', {
      admin: adminId,
      changes: settings
    });

    res.json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    next(error);
  }
};

// Get system health
export const getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: process.memoryUsage()
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      },
      database: {
        status: 'connected',
        collections: await mongoose.connection.db.listCollections().toArray()
      },
      cache: {
        status: 'connected',
        keys: await redis.keys('*')
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
}; 