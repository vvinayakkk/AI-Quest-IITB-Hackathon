import express from "express";
import { getUserProfile } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile", getUserProfile);

export default userRouter;
