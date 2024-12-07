import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.post("/new", createPost);
postRouter.put("/:id/update", updatePost);
postRouter.put("/:id/delete", deletePost);
postRouter.post("/:id/like", toggleLike);
postRouter.post("/:id/comment", addComment);
postRouter.delete("/:id/comments/:commentId", deleteComment);

export default postRouter;
