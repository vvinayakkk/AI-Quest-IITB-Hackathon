import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';
import Joi from 'joi';

// Validation middleware
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    throw new ValidationError('Validation failed', extractedErrors);
  };
};

// User validation rules
export const userValidation = {
  signup: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    body('department')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Department must be between 2 and 100 characters'),
  ],
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required'),
  ],
  updateProfile: {
    body: {
      name: Joi.string().min(2).max(50),
      bio: Joi.string().max(500),
      location: Joi.string().max(100),
      website: Joi.string().uri().max(200)
    }
  },
  changePassword: {
    body: {
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .message('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
    }
  }
};

// Post validation rules
export const postValidation = {
  createPost: {
    body: {
      title: Joi.string().required().min(10).max(200),
      content: Joi.string().required().min(30),
      tags: Joi.array().items(Joi.string()).max(5),
      category: Joi.string().required()
    }
  },
  updatePost: {
    body: {
      title: Joi.string().min(10).max(200),
      content: Joi.string().min(30),
      tags: Joi.array().items(Joi.string()).max(5),
      category: Joi.string()
    }
  },
  votePost: {
    body: {
      vote: Joi.number().valid(-1, 1).required()
    }
  },
  reportPost: {
    body: {
      reason: Joi.string().required().min(10).max(500)
    }
  },
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags && tags.length > 5) {
          throw new Error('Maximum 5 tags are allowed');
        }
        return true;
      }),
    body('images')
      .optional()
      .isArray()
      .withMessage('Images must be an array')
      .custom((images) => {
        if (images && images.length > 3) {
          throw new Error('Maximum 3 images are allowed');
        }
        return true;
      }),
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid post ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long'),
  ],
};

// Comment validation rules
export const commentValidation = {
  createComment: {
    body: {
      content: Joi.string().required().min(10).max(1000),
      postId: Joi.string().required(),
      parentId: Joi.string()
    }
  },
  updateComment: {
    body: {
      content: Joi.string().required().min(10).max(1000)
    }
  },
  voteComment: {
    body: {
      vote: Joi.number().valid(-1, 1).required()
    }
  },
  reportComment: {
    body: {
      reason: Joi.string().required().min(10).max(500)
    }
  }
};

// Query validation rules
export const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'views', 'likes'])
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be either asc or desc'),
  ],
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters long'),
  ],
};

export const moderationValidation = {
  handleReport: {
    body: {
      action: Joi.string().valid('delete', 'warn', 'ban').required(),
      reason: Joi.string().required().min(10).max(500)
    }
  },
  banUser: {
    body: {
      reason: Joi.string().required().min(10).max(500),
      duration: Joi.number().min(0) // Duration in milliseconds, 0 for permanent
    }
  },
  updateSettings: {
    body: {
      settings: Joi.object({
        maxPostsPerDay: Joi.number().min(1),
        maxCommentsPerDay: Joi.number().min(1),
        maxReportThreshold: Joi.number().min(1),
        autoModerationEnabled: Joi.boolean(),
        requireEmailVerification: Joi.boolean(),
        maintenanceMode: Joi.boolean(),
        allowedFileTypes: Joi.array().items(Joi.string()),
        maxFileSize: Joi.number().min(0)
      }).required()
    }
  }
};

// Notification validation schemas
export const notificationValidation = {
  updatePreferences: Joi.object({
    preferences: Joi.object({
      email: Joi.object({
        messages: Joi.boolean(),
        comments: Joi.boolean(),
        mentions: Joi.boolean(),
        answers: Joi.boolean(),
        badges: Joi.boolean()
      }),
      push: Joi.object({
        messages: Joi.boolean(),
        comments: Joi.boolean(),
        mentions: Joi.boolean(),
        answers: Joi.boolean(),
        badges: Joi.boolean()
      })
    }).required()
  }),

  sendMessage: Joi.object({
    recipientId: Joi.string().required(),
    content: Joi.string().min(1).max(1000).required()
  })
};

// Content validation schemas
export const contentValidation = {
  createCategory: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(500),
    icon: Joi.string(),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    parent: Joi.string().hex().length(24)
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(500),
    icon: Joi.string(),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    parent: Joi.string().hex().length(24),
    active: Joi.boolean()
  }),

  createTag: Joi.object({
    name: Joi.string().min(2).max(30).required(),
    description: Joi.string().max(200),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/)
  }),

  updateTag: Joi.object({
    name: Joi.string().min(2).max(30),
    description: Joi.string().max(200),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    active: Joi.boolean()
  }),

  createBadge: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200).required(),
    icon: Joi.string().required(),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    type: Joi.string().valid("manual", "automatic").required(),
    criteria: Joi.object({
      type: Joi.string().valid("posts", "comments", "votes", "reputation").required(),
      threshold: Joi.number().min(1).required(),
      timeFrame: Joi.string().valid("day", "week", "month", "year", "all")
    }).when("type", {
      is: "automatic",
      then: Joi.required()
    })
  }),

  updateBadge: Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(200),
    icon: Joi.string(),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    active: Joi.boolean(),
    criteria: Joi.object({
      type: Joi.string().valid("posts", "comments", "votes", "reputation"),
      threshold: Joi.number().min(1),
      timeFrame: Joi.string().valid("day", "week", "month", "year", "all")
    })
  }),

  awardBadge: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    reason: Joi.string().max(200)
  }),

  createAchievement: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200).required(),
    icon: Joi.string().required(),
    points: Joi.number().min(0).required(),
    type: Joi.string().valid("manual", "automatic").required(),
    criteria: Joi.object({
      type: Joi.string().valid("posts", "comments", "votes", "reputation", "badges").required(),
      threshold: Joi.number().min(1).required(),
      timeFrame: Joi.string().valid("day", "week", "month", "year", "all")
    }).when("type", {
      is: "automatic",
      then: Joi.required()
    })
  }),

  updateAchievement: Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(200),
    icon: Joi.string(),
    points: Joi.number().min(0),
    active: Joi.boolean(),
    criteria: Joi.object({
      type: Joi.string().valid("posts", "comments", "votes", "reputation", "badges"),
      threshold: Joi.number().min(1),
      timeFrame: Joi.string().valid("day", "week", "month", "year", "all")
    })
  }),

  awardAchievement: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    reason: Joi.string().max(200)
  })
};

// System Settings Validation
export const updateSystemSettings = Joi.object({
  siteName: Joi.string().min(3).max(50),
  siteDescription: Joi.string().max(200),
  maintenanceMode: Joi.boolean(),
  registrationEnabled: Joi.boolean(),
  emailVerificationRequired: Joi.boolean(),
  maxUploadSize: Joi.number().min(1).max(100),
  allowedFileTypes: Joi.array().items(Joi.string()),
  maxPostsPerDay: Joi.number().min(1).max(100),
  maxCommentsPerDay: Joi.number().min(1).max(1000),
  pointsPerPost: Joi.number().min(0).max(100),
  pointsPerComment: Joi.number().min(0).max(50),
  pointsPerVote: Joi.number().min(0).max(10),
  minPointsForBadge: Joi.number().min(0).max(1000),
  cacheTTL: Joi.number().min(60).max(86400),
  rateLimits: Joi.object({
    auth: Joi.number().min(1).max(100),
    posts: Joi.number().min(1).max(100),
    comments: Joi.number().min(1).max(1000),
    search: Joi.number().min(1).max(100)
  }),
  emailSettings: Joi.object({
    fromName: Joi.string().min(3).max(50),
    fromEmail: Joi.string().email(),
    smtpHost: Joi.string().hostname(),
    smtpPort: Joi.number().port(),
    smtpSecure: Joi.boolean(),
    smtpUser: Joi.string(),
    smtpPass: Joi.string()
  }),
  storageSettings: Joi.object({
    provider: Joi.string().valid("local", "s3", "gcs"),
    bucket: Joi.string(),
    region: Joi.string(),
    accessKey: Joi.string(),
    secretKey: Joi.string()
  })
});

// GitHub Integration Schemas
export const createGithubGistSchema = Joi.object({
  description: Joi.string().max(1000),
  files: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      content: Joi.string().required(),
      filename: Joi.string().required(),
    })
  ).required(),
  isPublic: Joi.boolean().default(false),
});

export const updateGithubGistSchema = Joi.object({
  description: Joi.string().max(1000),
  files: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      content: Joi.string().required(),
      filename: Joi.string().required(),
    })
  ).required(),
});

// External Auth Provider Schemas
export const configureAuthProviderSchema = Joi.object({
  tokens: Joi.object({
    access_token: Joi.string().required(),
    refresh_token: Joi.string(),
    expires_in: Joi.number(),
  }).required(),
  userInfo: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    picture: Joi.string().uri(),
    sub: Joi.string().required(),
  }).required(),
});

// Webhook Schemas
export const createWebhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  events: Joi.array().items(Joi.string()).min(1).required(),
  secret: Joi.string().min(32).required(),
});

export const updateWebhookSchema = Joi.object({
  url: Joi.string().uri(),
  events: Joi.array().items(Joi.string()).min(1),
  secret: Joi.string().min(32),
  status: Joi.string().valid("active", "inactive", "error"),
});

// API Key Schemas
export const createApiKeySchema = Joi.object({
  name: Joi.string().max(100).required(),
  permissions: Joi.array().items(Joi.string()).min(1).required(),
  expiresAt: Joi.date().min("now"),
});

export const updateApiKeySchema = Joi.object({
  name: Joi.string().max(100),
  permissions: Joi.array().items(Joi.string()).min(1),
  status: Joi.string().valid("active", "inactive", "expired"),
  expiresAt: Joi.date().min("now"),
});

// Integration Settings Schemas
export const updateIntegrationSettingsSchema = Joi.object({
  notifications: Joi.object({
    email: Joi.boolean(),
    push: Joi.boolean(),
    webhook: Joi.boolean(),
  }),
  privacy: Joi.object({
    showEmail: Joi.boolean(),
    showActivity: Joi.boolean(),
    showReputation: Joi.boolean(),
  }),
  integrations: Joi.object({
    github: Joi.object({
      enabled: Joi.boolean(),
      autoSync: Joi.boolean(),
      syncInterval: Joi.string().valid("hourly", "daily", "weekly"),
    }),
    google: Joi.object({
      enabled: Joi.boolean(),
      autoSync: Joi.boolean(),
      syncInterval: Joi.string().valid("hourly", "daily", "weekly"),
    }),
  }),
  webhooks: Joi.object({
    enabled: Joi.boolean(),
    maxRetries: Joi.number().min(1).max(10),
    retryInterval: Joi.number().min(60).max(3600),
  }),
  apiKeys: Joi.object({
    maxKeys: Joi.number().min(1).max(20),
    keyExpiry: Joi.number().min(1).max(365),
    requireExpiry: Joi.boolean(),
  }),
}); 