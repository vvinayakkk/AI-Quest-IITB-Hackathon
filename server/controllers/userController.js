import Users from "../models/users.js";
import Posts from "../models/post.js";

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const defaultNotifications = [
      {
        _id: "1",
        type: "upvote",
        message: 'Someone upvoted your question "How to implement WebSocket in React?"',
        read: false,
        createdAt: "2024-03-17T10:30:00Z",
        postId: "post1",
      },
      {
        _id: "2",
        type: "comment",
        message: 'New comment on "Best practices for state management in large React applications"',
        read: false,
        createdAt: "2024-03-17T08:30:00Z",
        postId: "post2",
      },
      {
        _id: "3",
        type: "reply",
        message: 'Someone replied to your comment on "Optimizing performance in Next.js applications"',
        read: false,
        createdAt: "2024-03-16T10:30:00Z",
        postId: "post3",
      },
      {
        _id: "4",
        type: "mention",
        message: 'You were mentioned in "How to implement WebSocket in React?"',
        read: false,
        createdAt: "2024-03-15T10:30:00Z",
        postId: "post4",
      },
    ];

    // Prepare badges data similar to the frontend
    const defaultBadgesData = {
      gold: [
        {
          name: "Problem Solver",
          description: "Solved 500 questions",
          progress: user.badgesCount.gold > 0 ? 85 : 0,
          earned: user.badgesCount.gold > 0,
        },
        {
          name: "Top Contributor",
          description: "1000+ helpful answers",
          progress: user.badgesCount.gold > 1 ? 100 : 0,
          earned: user.badgesCount.gold > 1,
        },
        {
          name: "Expert",
          description: "Maintained 90% acceptance rate",
          progress: user.badgesCount.gold > 2 ? 65 : 0,
          earned: user.badgesCount.gold > 2,
        },
      ],
      silver: [
        {
          name: "Quick Learner",
          description: "Solved 100 questions",
          progress: user.badgesCount.silver > 0 ? 100 : 0,
          earned: user.badgesCount.silver > 0,
        },
        {
          name: "Helper",
          description: "100+ accepted answers",
          progress: user.badgesCount.silver > 1 ? 100 : 0,
          earned: user.badgesCount.silver > 1,
        },
      ],
    };

    // Create a response object with user data, default badges and notifications
    const userProfile = {
      ...user.toObject(),
      badges: defaultBadgesData,
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userPosts = await Posts.find({ _id: { $in: user.posts } }).populate(
      "author",
      "firstName lastName avatar email verified department"
    );

    res.status(200).json({
      success: true,
      data: userPosts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user posts", error: error.message });
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    // Check if post is already bookmarked
    const user = await Users.findById(userId);
    const isBookmarked = user.bookmarks.includes(postId);

    // Update operation based on current bookmark status
    const operation = isBookmarked ? { $pull: { bookmarks: postId } } : { $addToSet: { bookmarks: postId } };

    const updatedUser = await Users.findByIdAndUpdate(userId, operation, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: isBookmarked ? "Bookmark removed successfully" : "Post bookmarked successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating bookmark",
      error: error.message,
    });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const bookmarks = user.bookmarks;
    const bookmarkedPosts = await Posts.find({ _id: { $in: bookmarks } })
      .populate("author", "firstName lastName avatar email verified department")
      .populate({
        path: "comments",
        populate: [
          {
            path: "author",
            select: "firstName lastName avatar email verified department",
          },
          {
            path: "replies",
            populate: {
              path: "author",
              select: "firstName lastName avatar email verified department",
            },
          },
        ],
      });

    res.status(200).json({
      success: true,
      data: bookmarkedPosts,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Error occured" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};


export { 
  getUserProfile, 
  getUserPosts, 
  bookmarkPost, 
  getBookmarks, 
  getAllUsers, 
};
