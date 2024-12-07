import Post from "../models/post.js";
import Users from "../models/users.js";

const findPostById = async (id) => {
  const post = await Post.findById(id).populate("author", "name avatar").populate({
    path: "comments.user",
    select: "name avatar",
  });
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};

const createPost = async (req, res) => {
  try {
  
    const { 
      title, 
      content, 
      tags = [], 
      images = [] 
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    const processedImages = images.map(image => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: image.data, // Assuming base64 encoded image data
      url: image.url || null // Optional URL if image is already uploaded
    }));

    console.log(req.user);
    

    const post = await Post.create({
      title,
      content,
      tags,
      images: processedImages,
      author: req.user.id, 
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await post.populate({
      path: 'author',
      select: 'firstName lastName avatar email' // Select specific user fields
    });

    const user = await Users.findById(req.user.id);
    user.posts.push(post._id);
    await user.save();

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
      ? { $text: { $search: search } } 
      : {};

    // Fetch posts
    const posts = await Post.find(query)
      .populate("author", "name avatar")
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

const getPost = async (req, res) => {
  const post = await findPostById(req.params.id);
  post.views += 1;
  await post.save();
  res.json({
    success: true,
    data: post,
  });
};

const updatePost = async (req, res) => {
  try {
    const { content, tags, images } = req.body;
    const post = await findPostById(req.params.id);

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    // Update post fields
    post.content = content;
    post.tags = tags;

    // Update images if provided
    if (images) {
      post.images = images.map((image) => ({
        id: image.id || Date.now().toString(),
        data: image.data,
      }));
    }

    await post.save();
    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await findPostById(req.params.id);

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await post.deleteOne();
    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleLike = async (req, res) => {
  const post = await findPostById(req.params.id);
  const isLiked = post.likes.includes(req.user._id);
  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();
  res.json({
    success: true,
    data: {
      likes: post.likes.length,
      isLiked: !isLiked,
    },
  });
};

const addComment = async (req, res) => {
  const { content } = req.body;
  const post = await findPostById(req.params.id);
  const comment = {
    user: req.user._id,
    content,
  };
  post.comments.push(comment);
  await post.save();
  await post.populate("comments.user", "name avatar");
  res.status(201).json({
    success: true,
    data: post.comments[post.comments.length - 1],
  });
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const post = await findPostById(req.params.id);
  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this comment",
    });
  }
  comment.deleteOne();
  await post.save();
  res.json({
    success: true,
    message: "Comment deleted successfully",
  });
};

export { createPost, getPosts, getPost, updatePost, deletePost, toggleLike, addComment, deleteComment };
