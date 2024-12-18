import express from "express";
import { getUserProfile, getUserPosts, bookmarkPost, getBookmarks, readNotification, getAllUsers } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile", getUserProfile);
userRouter.get("/posts", getUserPosts);
userRouter.get("/get-bookmark", getBookmarks);
userRouter.post("/add-bookmark", bookmarkPost);
userRouter.patch("/notification/:id/read", readNotification);
userRouter.get("/allUsers", getAllUsers);
// userRouter.get("/ban/:id", deleteUser);

export default userRouter;
