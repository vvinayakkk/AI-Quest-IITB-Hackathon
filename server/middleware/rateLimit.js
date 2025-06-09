import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes rate limiter (stricter)
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Post creation rate limiter
export const postLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:post:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 posts per hour
  message: {
    success: false,
    message: 'Too many posts created, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Comment creation rate limiter
export const commentLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:comment:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 comments per 15 minutes
  message: {
    success: false,
    message: 'Too many comments created, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter
export const searchLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:search:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 