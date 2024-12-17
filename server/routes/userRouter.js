import express from "express";
import { getUserProfile, bookmarkPost, getBookmarks } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile", getUserProfile);
userRouter.get("/get-bookmark", getBookmarks);
userRouter.post("/add-bookmark", bookmarkPost);

export default userRouter;
