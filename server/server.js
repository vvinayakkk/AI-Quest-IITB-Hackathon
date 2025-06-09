import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

// Import routes
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import systemRouter from "./routes/systemRouter.js";
import integrationRouter from "./routes/integrationRouter.js";
import collectionRouter from "./routes/collectionRouter.js";
import contentFlagRouter from "./routes/contentFlagRouter.js";
import userGroupRouter from "./routes/userGroupRouter.js";
import messageRouter from "./routes/messageRouter.js";
import communityGuidelinesRouter from "./routes/communityGuidelinesRouter.js";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.LOG_FORMAT || "dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/system", systemRouter);
app.use("/api/integrations", integrationRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/flags", contentFlagRouter);
app.use("/api/groups", userGroupRouter);
app.use("/api/messages", messageRouter);
app.use("/api/guidelines", communityGuidelinesRouter);

// Error handling
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
    
    // Create indexes
    mongoose.connection.db.collections().then((collections) => {
      collections.forEach((collection) => {
        collection.createIndexes();
      });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

export default app;
