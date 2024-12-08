import express from "express";
import {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.get("/", getPosts);
postRouter.post("/new", createPost);
postRouter.post("/:id/like", toggleLike);
postRouter.post("/:id/comment", addComment);

export default postRouter;
