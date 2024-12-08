import Post from "../models/post.js";
import mongoose from 'mongoose';

const findPostById = async (id) => {
  const post = await Post.findById(id)
    .populate("author", "firstName lastName avatar email")
    .populate({
      path: "comments.user",
      select: "firstName lastName avatar email"
    });
  
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};

const createPost = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID from JWT

    const { 
      title, 
      content, 
      tags = [], 
      images = [] 
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    // Process images with base64 or URL support
    const processedImages = images.map(image => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: image.data || null,
      url: image.url || null,
      uploadedAt: new Date()
    }));

    const post = await Post.create({
      title,
      content,
      tags,
      images: processedImages,
      author: userId,
      likes: [],
      comments: [],
      views: 0
    });

    // Populate author details
    await post.populate({
      path: 'author',
      select: 'firstName lastName avatar email'
    });

    res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
      error: process.env.NODE_ENV === 'development' ? error.stack : {}
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Construct query for search
    const query = search 
      ? { 
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Fetch posts
    const posts = await Post.find(query)
      .populate('author', 'firstName lastName avatar email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID
    const post = await findPostById(req.params.id);
    
    // Check if user has already liked the post
    const isLiked = post.likes.some(
      like => like.toString() === userId.toString()
    );

    if (isLiked) {
      // Remove like
      post.likes = post.likes.filter(
        like => like.toString() !== userId.toString()
      );
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likes: post.likes.length,
        isLiked: !isLiked
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    const post = await findPostById(req.params.id);

    const newComment = {
      user: userId,
      content,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment's user details
    await post.populate({
      path: 'comments.user',
      select: 'firstName lastName avatar email'
    });

    // Get the last added comment
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      data: addedComment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export { 
  createPost, 
  getPosts, 
  toggleLike, 
  addComment 
};