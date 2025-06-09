import express from "express";
import { 
  signup, 
  login, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  resendVerification, 
  refreshToken, 
  logout,
  getCurrentUser 
} from "../controllers/authController.js";
import { validate } from "../middleware/validation.js";
import { userValidation } from "../middleware/validation.js";
import { verifyToken } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/signup", authLimiter, validate(userValidation.signup), signup);
authRouter.post("/login", authLimiter, validate(userValidation.login), login);
authRouter.post("/forgot-password", authLimiter, forgotPassword);
authRouter.post("/reset-password", authLimiter, resetPassword);
authRouter.post("/verify-email", authLimiter, verifyEmail);
authRouter.post("/resend-verification", authLimiter, resendVerification);

// Protected routes
authRouter.post("/refresh-token", verifyToken, refreshToken);
authRouter.post("/logout", verifyToken, logout);
authRouter.get("/me", verifyToken, getCurrentUser);

export default authRouter;
