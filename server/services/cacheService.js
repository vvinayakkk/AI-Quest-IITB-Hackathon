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

// Set cache
export const setCache = async (key, value, ttl = config.cache.ttl) => {
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.set(key, stringValue, 'EX', ttl);
    logger.debug(`Cache set for key: ${key}`);
  } catch (error) {
    logger.error('Cache set error:', error);
  }
};

// Get cache
export const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (value) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(value);
    }
    logger.debug(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

// Delete cache
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache deleted for key: ${key}`);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
};

// Clear cache by pattern
export const clearCacheByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug(`Cache cleared for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};

// Cache middleware
export const cacheMiddleware = (ttl = config.cache.ttl) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    const cachedResponse = await getCache(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original res.json
    const originalJson = res.json;

    // Override res.json
    res.json = function (body) {
      setCache(key, body, ttl);
      return originalJson.call(this, body);
    };

    next();
  };
};

// Cache keys
export const cacheKeys = {
  user: (id) => `user:${id}`,
  post: (id) => `post:${id}`,
  posts: (page, limit) => `posts:${page}:${limit}`,
  userPosts: (userId, page, limit) => `user:${userId}:posts:${page}:${limit}`,
  comments: (postId, page, limit) => `post:${postId}:comments:${page}:${limit}`,
  search: (query, page, limit) => `search:${query}:${page}:${limit}`,
};

// Clear user cache
export const clearUserCache = async (userId) => {
  await clearCacheByPattern(`user:${userId}*`);
};

// Clear post cache
export const clearPostCache = async (postId) => {
  await clearCacheByPattern(`post:${postId}*`);
};

// Clear all cache
export const clearAllCache = async () => {
  await redisClient.flushall();
  logger.info('All cache cleared');
}; 