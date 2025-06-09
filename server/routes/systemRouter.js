import express from "express";
import {
  getSystemHealth,
  getSystemVersion,
  getSystemSettings,
  updateSystemSettings,
  getSystemLogs,
  clearSystemLogs,
  getSystemMetrics,
  getSystemBackups,
  createSystemBackup,
  restoreSystemBackup,
  getSystemTasks,
  runSystemTask
} from "../controllers/systemController.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validation.js";
import { cacheMiddleware } from "../services/cacheService.js";

const router = express.Router();

// System Health & Version
router.get("/health", cacheMiddleware(60), getSystemHealth);
router.get("/version", cacheMiddleware(3600), getSystemVersion);

// System Settings
router.get("/settings", verifyToken, verifyAdmin, cacheMiddleware(300), getSystemSettings);
router.put("/settings", verifyToken, verifyAdmin, rateLimit(10), validate("updateSystemSettings"), updateSystemSettings);

// System Logs
router.get("/logs", verifyToken, verifyAdmin, rateLimit(20), getSystemLogs);
router.delete("/logs", verifyToken, verifyAdmin, rateLimit(5), clearSystemLogs);

// System Metrics
router.get("/metrics", verifyToken, verifyAdmin, cacheMiddleware(60), getSystemMetrics);

// System Backups
router.get("/backups", verifyToken, verifyAdmin, rateLimit(20), getSystemBackups);
router.post("/backups", verifyToken, verifyAdmin, rateLimit(5), createSystemBackup);
router.post("/backups/:id/restore", verifyToken, verifyAdmin, rateLimit(5), restoreSystemBackup);

// System Tasks
router.get("/tasks", verifyToken, verifyAdmin, cacheMiddleware(300), getSystemTasks);
router.post("/tasks/:id/run", verifyToken, verifyAdmin, rateLimit(10), runSystemTask);

export default router; 