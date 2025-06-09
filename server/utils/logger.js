import winston from 'winston';
import path from 'path';
import config from '../config/config.js';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logs directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(config.logging.directory)) {
  fs.mkdirSync(config.logging.directory, { recursive: true });
}

// Create the logger
const logger = createLogger({
  level: config.logging.level,
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        consoleFormat
      ),
    }),
    // File transport for all logs
    new transports.File({
      filename: path.join(config.logging.directory, 'combined.log'),
      format: combine(
        timestamp(),
        json()
      ),
    }),
    // File transport for error logs
    new transports.File({
      filename: path.join(config.logging.directory, 'error.log'),
      level: 'error',
      format: combine(
        timestamp(),
        json()
      ),
    }),
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new transports.File({
      filename: path.join(config.logging.directory, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(config.logging.directory, 'rejections.log'),
    }),
  ],
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger; 