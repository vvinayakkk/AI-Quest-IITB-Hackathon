import Users from '../models/users.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "your_jwt_secret_key";

export const getUserProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization.split(' ')[1];
    
    // Verify and decode the token
    const decoded = jwt.verify(token,JWT_SECRET);
    console.log(decoded);
    
    // Find user by ID from decoded token
    const user = await Users.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare badges data similar to the frontend
    const defaultBadgesData = {
      gold: [
        {
          name: "Problem Solver",
          description: "Solved 500 questions",
          progress: user.badgesCount.gold > 0 ? 85 : 0,
          earned: user.badgesCount.gold > 0
        },
        {
          name: "Top Contributor",
          description: "1000+ helpful answers",
          progress: user.badgesCount.gold > 1 ? 100 : 0,
          earned: user.badgesCount.gold > 1
        },
        {
          name: "Expert",
          description: "Maintained 90% acceptance rate",
          progress: user.badgesCount.gold > 2 ? 65 : 0,
          earned: user.badgesCount.gold > 2
        }
      ],
      silver: [
        {
          name: "Quick Learner",
          description: "Solved 100 questions",
          progress: user.badgesCount.silver > 0 ? 100 : 0,
          earned: user.badgesCount.silver > 0
        },
        {
          name: "Helper",
          description: "100+ accepted answers",
          progress: user.badgesCount.silver > 1 ? 100 : 0,
          earned: user.badgesCount.silver > 1
        }
      ]
    };

    // Create a response object with user data and default badges
    const userProfile = {
      ...user.toObject(),
      badges: defaultBadgesData
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};