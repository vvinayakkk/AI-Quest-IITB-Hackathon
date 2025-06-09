import { Octokit } from "@octokit/rest";
import { logger } from "../utils/logger.js";
import { Integration } from "../models/index.js";

// Initialize Octokit client
const createOctokitClient = (accessToken) => {
  return new Octokit({
    auth: accessToken,
  });
};

// Get GitHub authentication URL
export const getGithubAuthUrl = () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  const scope = "repo gist";

  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
};

// Exchange code for access token
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return data;
  } catch (error) {
    logger.error("Error exchanging code for token:", error);
    throw error;
  }
};

// Get user repositories
export const getUserRepositories = async (userId) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider: "github",
      type: "oauth",
      status: "active",
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    const octokit = createOctokitClient(integration.accessToken);
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    return data;
  } catch (error) {
    logger.error("Error getting user repositories:", error);
    throw error;
  }
};

// Get user gists
export const getUserGists = async (userId) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider: "github",
      type: "oauth",
      status: "active",
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    const octokit = createOctokitClient(integration.accessToken);
    const { data } = await octokit.gists.list({
      per_page: 100,
    });

    return data;
  } catch (error) {
    logger.error("Error getting user gists:", error);
    throw error;
  }
};

// Create gist
export const createGist = async (userId, description, files, isPublic = false) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider: "github",
      type: "oauth",
      status: "active",
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    const octokit = createOctokitClient(integration.accessToken);
    const { data } = await octokit.gists.create({
      description,
      public: isPublic,
      files,
    });

    return data;
  } catch (error) {
    logger.error("Error creating gist:", error);
    throw error;
  }
};

// Update gist
export const updateGist = async (userId, gistId, description, files) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider: "github",
      type: "oauth",
      status: "active",
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    const octokit = createOctokitClient(integration.accessToken);
    const { data } = await octokit.gists.update({
      gist_id: gistId,
      description,
      files,
    });

    return data;
  } catch (error) {
    logger.error("Error updating gist:", error);
    throw error;
  }
};

// Delete gist
export const deleteGist = async (userId, gistId) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider: "github",
      type: "oauth",
      status: "active",
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    const octokit = createOctokitClient(integration.accessToken);
    await octokit.gists.delete({
      gist_id: gistId,
    });

    return true;
  } catch (error) {
    logger.error("Error deleting gist:", error);
    throw error;
  }
};

// Refresh GitHub access token
export const refreshGithubToken = async (userId) => {
  try {
    const integration = await Integration.findOne({
      user: userId,
      provider: "github",
      type: "oauth",
    });

    if (!integration) {
      throw new Error("GitHub integration not found");
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        refresh_token: integration.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    // Update integration with new tokens
    integration.accessToken = data.access_token;
    integration.refreshToken = data.refresh_token;
    integration.expiresAt = new Date(Date.now() + data.expires_in * 1000);
    await integration.save();

    return data;
  } catch (error) {
    logger.error("Error refreshing GitHub token:", error);
    throw error;
  }
}; 