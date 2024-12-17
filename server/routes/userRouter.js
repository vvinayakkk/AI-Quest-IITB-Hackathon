import express from "express";
import { getUserProfile, bookmarkPost, getBookmarks } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile", getUserProfile);
userRouter.post("/add-bookmark", bookmarkPost);
userRouter.get("/get-bookmark", getBookmarks);

export default userRouter;
