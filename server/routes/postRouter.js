import express from "express";
import { createPost, getPost, getPosts, toggleLike, addComment, deletePost, deleteComment } from "../controllers/postController.js";
import { toggleUpvote, addReply, deleteReply } from "../controllers/commentController.js";

const postRouter = express.Router();

// Post routes
postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.post("/new", createPost);
postRouter.post("/:id/like", toggleLike);
postRouter.post("/:id/comment", addComment);
postRouter.delete("/:id", deletePost);

// Comment routes
postRouter.delete("/comment/:id", deleteComment);
postRouter.post("/comment/:id/upvote", toggleUpvote);
postRouter.post("/comment/:id/reply", addReply);
postRouter.delete("/comment/:commentId/reply/:replyId", deleteReply);

export default postRouter;
