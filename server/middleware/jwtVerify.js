import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if the authorization header exists
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }

        // Extract the token from the header
        const token = authHeader.split(' ')[1];

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded payload to req.user
        req.user = decoded;

        // Call the next middleware
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export default verifyJWT;
