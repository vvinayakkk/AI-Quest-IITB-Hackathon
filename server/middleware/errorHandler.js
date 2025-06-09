import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);

  // Handle validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: err.details.map((detail) => detail.message),
    });
  }

  // Handle authentication errors
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Invalid or missing token",
    });
  }

  // Handle authorization errors
  if (err.name === "ForbiddenError") {
    return res.status(403).json({
      success: false,
      error: "Authorization Error",
      message: "Insufficient permissions",
    });
  }

  // Handle not found errors
  if (err.name === "NotFoundError") {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: err.message,
    });
  }

  // Handle database errors
  if (err.name === "MongoError" || err.name === "MongooseError") {
    return res.status(500).json({
      success: false,
      error: "Database Error",
      message: "An error occurred while accessing the database",
    });
  }

  // Handle all other errors
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred",
  });
}; 