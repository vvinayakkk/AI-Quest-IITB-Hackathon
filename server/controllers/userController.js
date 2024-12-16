import Users from "../models/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const getUserProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization.split(" ")[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    // Find user by ID from decoded token
    const user = await Users.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
      notifications: defaultNotifications,
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
