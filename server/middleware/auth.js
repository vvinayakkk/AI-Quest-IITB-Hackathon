import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      return next(new AuthorizationError('Not authorized to perform this action'));
    }

    next();
  };
};

// Check if user is the owner of the resource
export const isOwner = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      if (!resource) {
        return next(new NotFoundError('Resource not found'));
      }

      if (resource.author.toString() !== req.user.id && !['Admin', 'Moderator'].includes(req.user.role)) {
        return next(new AuthorizationError('Not authorized to perform this action'));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting for login attempts
export const loginAttempts = new Map();

export const checkLoginAttempts = (req, res, next) => {
  const ip = req.ip;
  const attempts = loginAttempts.get(ip) || { count: 0, timestamp: Date.now() };

  // Reset attempts if lockout period has passed
  if (Date.now() - attempts.timestamp > config.security.lockoutTime) {
    attempts.count = 0;
    attempts.timestamp = Date.now();
  }

  // Check if user is locked out
  if (attempts.count >= config.security.maxLoginAttempts) {
    const timeLeft = Math.ceil((config.security.lockoutTime - (Date.now() - attempts.timestamp)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${timeLeft} seconds.`
    });
  }

  // Increment attempt count
  attempts.count++;
  loginAttempts.set(ip, attempts);

  next();
};

// Reset login attempts on successful login
export const resetLoginAttempts = (req, res, next) => {
  const ip = req.ip;
  loginAttempts.delete(ip);
  next();
}; 