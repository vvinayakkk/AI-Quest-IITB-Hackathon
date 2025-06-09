import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { processImage } from '../services/uploadService.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { clearUserCache } from '../services/cacheService.js';
import logger from '../utils/logger.js';
import { UserProfile } from "../models/index.js";
import { ForbiddenError } from "../utils/errors.js";
import { uploadToCDN, deleteFromCDN } from "../services/cdnService.js";
import { generateAvatar } from "../utils/avatarGenerator.js";

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, website } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;

    await user.save();
    await clearUserCache(userId);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Send notification email
    await sendNotificationEmail(user.email, 'Password Changed', 'Your password has been successfully changed.');

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update avatar
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Process and optimize the image
    const processedImage = await processImage(req.file.path);
    
    // Update user avatar
    user.avatar = processedImage.filename;
    await user.save();
    await clearUserCache(userId);

    res.json({
      success: true,
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetToken -verificationToken');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user reputation
export const getUserReputation = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('reputation reputationHistory');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        reputation: user.reputation,
        history: user.reputationHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user activity
export const getUserActivity = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('posts comments');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        posts: user.posts,
        comments: user.comments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user badges
export const getUserBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('badges');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user.badges
    });
  } catch (error) {
    next(error);
  }
};

// Follow user
export const followUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username });
    
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    if (targetUser._id.toString() === req.user.id) {
      throw new ValidationError("Cannot follow yourself");
    }

    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    await profile.follow(targetUser._id);

    // Send notification
    const targetProfile = await UserProfile.findOne({ user: targetUser._id });
    if (targetProfile?.preferences.followNotifications) {
      await sendNotificationEmail({
        to: targetUser.email,
        type: "follow",
        data: {
          userName: targetUser.username,
          followerName: req.user.username
        }
      });
    }

    res.json({ message: "User followed successfully" });
  } catch (error) {
    logger.error("Error following user:", error);
    throw error;
  }
};

// Unfollow user
export const unfollowUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username });
    
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    await profile.unfollow(targetUser._id);

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    logger.error("Error unfollowing user:", error);
    throw error;
  }
};

// Get followers
export const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Check privacy settings
    if (profile.privacy.profileVisibility === "private" && req.user?.id !== profile.user.toString()) {
      throw new ForbiddenError("This profile is private");
    }

    const followers = await UserProfile.find({ user: { $in: profile.followers } })
      .populate("user", "username email");

    res.json(followers);
  } catch (error) {
    logger.error("Error getting followers:", error);
    throw error;
  }
};

// Get following
export const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Check privacy settings
    if (profile.privacy.profileVisibility === "private" && req.user?.id !== profile.user.toString()) {
      throw new ForbiddenError("This profile is private");
    }

    const following = await UserProfile.find({ user: { $in: profile.following } })
      .populate("user", "username email");

    res.json(following);
  } catch (error) {
    logger.error("Error getting following:", error);
    throw error;
  }
};

// Profile Management
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Check privacy settings
    if (profile.privacy.profileVisibility === "private" && req.user?.id !== profile.user.toString()) {
      throw new ForbiddenError("This profile is private");
    }

    res.json(profile);
  } catch (error) {
    logger.error("Error getting profile:", error);
    throw error;
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { language, timezone, theme, emailNotifications, pushNotifications, mentionNotifications, commentNotifications, followNotifications } = req.body;
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Update preferences
    if (language) profile.preferences.language = language;
    if (timezone) profile.preferences.timezone = timezone;
    if (theme) profile.preferences.theme = theme;
    if (emailNotifications !== undefined) profile.preferences.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) profile.preferences.pushNotifications = pushNotifications;
    if (mentionNotifications !== undefined) profile.preferences.mentionNotifications = mentionNotifications;
    if (commentNotifications !== undefined) profile.preferences.commentNotifications = commentNotifications;
    if (followNotifications !== undefined) profile.preferences.followNotifications = followNotifications;

    await profile.save();

    res.json(profile.preferences);
  } catch (error) {
    logger.error("Error updating preferences:", error);
    throw error;
  }
};

export const updatePrivacy = async (req, res) => {
  try {
    const { profileVisibility, activityVisibility, emailVisibility } = req.body;
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Update privacy settings
    if (profileVisibility) profile.privacy.profileVisibility = profileVisibility;
    if (activityVisibility) profile.privacy.activityVisibility = activityVisibility;
    if (emailVisibility) profile.privacy.emailVisibility = emailVisibility;

    await profile.save();

    res.json(profile.privacy);
  } catch (error) {
    logger.error("Error updating privacy settings:", error);
    throw error;
  }
};

// Avatar Management
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Upload to CDN
    const avatarUrl = await uploadToCDN(req.file, "avatars");

    // Delete old avatar if exists
    if (profile.avatar && profile.avatar !== process.env.DEFAULT_AVATAR_URL) {
      await deleteFromCDN(profile.avatar);
    }

    profile.avatar = avatarUrl;
    await profile.save();

    res.json({ avatar: avatarUrl });
  } catch (error) {
    logger.error("Error uploading avatar:", error);
    throw error;
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Delete current avatar if exists
    if (profile.avatar && profile.avatar !== process.env.DEFAULT_AVATAR_URL) {
      await deleteFromCDN(profile.avatar);
    }

    // Generate new default avatar
    const defaultAvatar = await generateAvatar(req.user.username);
    profile.avatar = defaultAvatar;
    await profile.save();

    res.json({ avatar: defaultAvatar });
  } catch (error) {
    logger.error("Error deleting avatar:", error);
    throw error;
  }
};

// Social Links
export const addSocialLink = async (req, res) => {
  try {
    const { platform, url } = req.body;
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Check if platform already exists
    const existingLink = profile.socialLinks.find(link => link.platform === platform);
    if (existingLink) {
      throw new ValidationError("Social link for this platform already exists");
    }

    // Check if max social links reached
    if (profile.socialLinks.length >= (process.env.MAX_SOCIAL_LINKS || 5)) {
      throw new ValidationError("Maximum number of social links reached");
    }

    profile.socialLinks.push({ platform, url });
    await profile.save();

    res.json(profile.socialLinks);
  } catch (error) {
    logger.error("Error adding social link:", error);
    throw error;
  }
};

export const removeSocialLink = async (req, res) => {
  try {
    const { platform } = req.params;
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    profile.socialLinks = profile.socialLinks.filter(link => link.platform !== platform);
    await profile.save();

    res.json(profile.socialLinks);
  } catch (error) {
    logger.error("Error removing social link:", error);
    throw error;
  }
};

// Reputation
export const getReputation = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    res.json({
      score: profile.reputation.score,
      rank: await UserProfile.countDocuments({ "reputation.score": { $gt: profile.reputation.score } }) + 1
    });
  } catch (error) {
    logger.error("Error getting reputation:", error);
    throw error;
  }
};

export const getReputationHistory = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Check privacy settings
    if (profile.privacy.activityVisibility === "private" && req.user?.id !== profile.user.toString()) {
      throw new ForbiddenError("This user's activity is private");
    }

    res.json(profile.reputation.history);
  } catch (error) {
    logger.error("Error getting reputation history:", error);
    throw error;
  }
};

// Saved Items
export const saveItem = async (req, res) => {
  try {
    const { type, itemId } = req.body;
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    await profile.saveItem(type, itemId);

    res.json({ message: "Item saved successfully" });
  } catch (error) {
    logger.error("Error saving item:", error);
    throw error;
  }
};

export const unsaveItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    await profile.unsaveItem(type, id);

    res.json({ message: "Item unsaved successfully" });
  } catch (error) {
    logger.error("Error unsaving item:", error);
    throw error;
  }
};

export const getSavedItems = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const savedItems = await Promise.all(
      profile.savedItems.map(async item => {
        const model = item.type === "post" ? Post : Comment;
        const savedItem = await model.findById(item.item);
        return {
          type: item.type,
          item: savedItem,
          savedAt: item.savedAt
        };
      })
    );

    res.json(savedItems);
  } catch (error) {
    logger.error("Error getting saved items:", error);
    throw error;
  }
};

// Activity History
export const getActivityHistory = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await UserProfile.findByUsername(username);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    // Check privacy settings
    if (profile.privacy.activityVisibility === "private" && req.user?.id !== profile.user.toString()) {
      throw new ForbiddenError("This user's activity is private");
    }

    res.json(profile.activityHistory);
  } catch (error) {
    logger.error("Error getting activity history:", error);
    throw error;
  }
};

// Top Users
export const getTopUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topUsers = await UserProfile.getTopUsers(parseInt(limit));

    res.json(topUsers);
  } catch (error) {
    logger.error("Error getting top users:", error);
    throw error;
  }
}; 