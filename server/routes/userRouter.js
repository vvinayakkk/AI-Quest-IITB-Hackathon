import express from "express";
import { getUserProfile, getUserPosts, bookmarkPost, getBookmarks, getAllUsers } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile", getUserProfile);
userRouter.get("/get-bookmark", getBookmarks);
userRouter.get("/posts", getUserPosts);
userRouter.post("/add-bookmark", bookmarkPost);
userRouter.get("/allUsers", getAllUsers);
// userRouter.get("/ban/:id", deleteUser);

export default userRouter;
