import Users from "../models/users.js"; // Assuming the schema is in a "models" folder
// Get all posts
export const getAllPosts = async (req, res) => {
    try {
      const posts = await Users.find();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Register a new user
  export const registerUser = async (req, res) => {
    try {
      const { id, username, avatar } = req.body;
  
      // Check if required fields are provided
      if (!id || !username || !avatar) {
        return res.status(400).json({ message: "id, username, and avatar are required." });
      }
  
      // Create a new user instance with defaults for optional fields
      const newUser = new Users({
        id,
        username,
        avatar,
        time: "Just now", // Default time
        content: "",      // Default content as an empty string
        votes: 0,         // Default votes to 0
        category: "General", // Default category
        tags: [],         // Default to an empty array
        replies: [],      // Default to an empty array
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  
  // Get all users
  export const getAllUsers = async (req, res) => {
    try {
      const users = await Users.find({}, { username: 1, avatar: 1, _id: 0 }); // Fetch only username and avatar
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get number of answers (replies)
  export const getNumberOfAnswers = async (req, res) => {
    try {
      const posts = await Users.find();
      let totalReplies = 0;
  
      posts.forEach(post => {
        totalReplies += post.replies.length;
      });
  
      res.status(200).json({ totalReplies });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const addPost = async (req, res) => {
    try {
      const { id, username, avatar, time, content, votes, category, tags, replies } = req.body;
  
      // Create a new post
      const newPost = new Users({
        id,
        username,
        avatar,
        time,
        content,
        votes: votes || 0, // Default to 0 if not provided
        category,
        tags: tags || [],  // Default to an empty array if not provided
        replies: replies || [], // Default to an empty array if not provided
      });
  
      // Save the post to the database
      await newPost.save();
  
      res.status(201).json({ message: "Post added successfully", post: newPost });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Add a reply to a specific post
  export const addReply = async (req, res) => {
    try {
      const { postId } = req.params; // Post ID from the URL
      const { id, username, content, time } = req.body; // Reply data from the request body
  
      // Find the post by ID
      const post = await Users.findOne({ id: postId });
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Add the new reply
      const newReply = {
        id,
        username,
        content,
        time,
      };
      post.replies.push(newReply);
  
      // Save the updated post
      await post.save();
  
      res.status(200).json({ message: "Reply added successfully", post });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };