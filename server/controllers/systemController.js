import { SystemSettings, SystemLog, SystemBackup, SystemTask } from "../models/index.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { clearCacheByPattern } from "../services/cacheService.js";
import { exec } from "child_process";
import { promisify } from "util";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";
import { join } from "path";
import { version } from "../../package.json";
import os from "os";

const execAsync = promisify(exec);

// System Health & Version
export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        loadAvg: os.loadavg(),
        cores: os.cpus().length
      },
      database: {
        status: "connected"
      },
      cache: {
        status: "connected"
      }
    };

    res.json(health);
  } catch (error) {
    logger.error("Error getting system health:", error);
    throw error;
  }
};

export const getSystemVersion = async (req, res) => {
  try {
    res.json({
      version,
      node: process.version,
      platform: process.platform,
      arch: process.arch
    });
  } catch (error) {
    logger.error("Error getting system version:", error);
    throw error;
  }
};

// System Settings
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne().select("-emailSettings.smtpPass -storageSettings.secretKey");
    if (!settings) {
      throw new NotFoundError("System settings not found");
    }
    res.json(settings);
  } catch (error) {
    logger.error("Error getting system settings:", error);
    throw error;
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    if (!settings) {
      throw new NotFoundError("System settings not found");
    }

    // Update settings
    Object.assign(settings, req.body);
    await settings.save();

    // Clear relevant caches
    await clearCacheByPattern("settings:*");
    await clearCacheByPattern("system:*");

    res.json(settings);
  } catch (error) {
    logger.error("Error updating system settings:", error);
    throw error;
  }
};

// System Logs
export const getSystemLogs = async (req, res) => {
  try {
    const { level, startDate, endDate, limit = 100 } = req.query;
    const query = {};

    if (level) {
      query.level = level;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const logs = await SystemLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    logger.error("Error getting system logs:", error);
    throw error;
  }
};

export const clearSystemLogs = async (req, res) => {
  try {
    const { before } = req.query;
    const query = {};

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    await SystemLog.deleteMany(query);

    res.json({ message: "Logs cleared successfully" });
  } catch (error) {
    logger.error("Error clearing system logs:", error);
    throw error;
  }
};

// System Metrics
export const getSystemMetrics = async (req, res) => {
  try {
    const [
      userCount,
      postCount,
      commentCount,
      activeUsers,
      newUsers,
      newPosts,
      newComments
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Post.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Comment.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    res.json({
      total: {
        users: userCount,
        posts: postCount,
        comments: commentCount
      },
      last24Hours: {
        activeUsers,
        newUsers,
        newPosts,
        newComments
      }
    });
  } catch (error) {
    logger.error("Error getting system metrics:", error);
    throw error;
  }
};

// System Backups
export const getSystemBackups = async (req, res) => {
  try {
    const backups = await SystemBackup.find()
      .sort({ createdAt: -1 });

    res.json(backups);
  } catch (error) {
    logger.error("Error getting system backups:", error);
    throw error;
  }
};

export const createSystemBackup = async (req, res) => {
  try {
    const { description } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = join(process.cwd(), "backups", `backup-${timestamp}.gz`);

    // Create backup directory if it doesn't exist
    await execAsync(`mkdir -p ${join(process.cwd(), "backups")}`);

    // Create MongoDB dump
    const dumpCommand = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${backupPath}" --gzip`;
    await execAsync(dumpCommand);

    // Create backup record
    const backup = await SystemBackup.create({
      filename: `backup-${timestamp}.gz`,
      path: backupPath,
      size: (await fs.promises.stat(backupPath)).size,
      description,
      createdBy: req.user.id
    });

    res.status(201).json(backup);
  } catch (error) {
    logger.error("Error creating system backup:", error);
    throw error;
  }
};

export const restoreSystemBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await SystemBackup.findById(id);
    if (!backup) {
      throw new NotFoundError("Backup not found");
    }

    // Restore MongoDB dump
    const restoreCommand = `mongorestore --uri="${process.env.MONGODB_URI}" --archive="${backup.path}" --gzip`;
    await execAsync(restoreCommand);

    // Clear all caches
    await clearCacheByPattern("*");

    res.json({ message: "Backup restored successfully" });
  } catch (error) {
    logger.error("Error restoring system backup:", error);
    throw error;
  }
};

// System Tasks
export const getSystemTasks = async (req, res) => {
  try {
    const tasks = await SystemTask.find()
      .sort({ name: 1 });

    res.json(tasks);
  } catch (error) {
    logger.error("Error getting system tasks:", error);
    throw error;
  }
};

export const runSystemTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await SystemTask.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    // Execute task
    const result = await execAsync(task.command);

    // Update task last run
    task.lastRun = new Date();
    task.lastResult = result.stdout;
    await task.save();

    res.json({
      message: "Task executed successfully",
      result: result.stdout
    });
  } catch (error) {
    logger.error("Error running system task:", error);
    throw error;
  }
}; 