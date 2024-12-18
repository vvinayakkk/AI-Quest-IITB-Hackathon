import express from "express";
import { createPost, getPost, getPosts, toggleLike, deletePost,addComment, deleteComment } from "../controllers/postController.js";
import { toggleUpvote, addReply, deleteReply, markCorrectComment } from "../controllers/commentController.js";

const postRouter = express.Router();

// Post routes
postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.post("/new", createPost);
postRouter.post("/:id/like", toggleLike);
postRouter.delete("/:id", deletePost);

// Comment routes
postRouter.post("/:id/comment", addComment);
postRouter.delete("/comment/:id", deleteComment);
postRouter.post("/comment/:id/upvote", toggleUpvote);
postRouter.post("/comment/:id/reply", addReply);
postRouter.post("/comment/:id/correct", markCorrectComment);
postRouter.delete("/comment/:commentId/reply/:replyId", deleteReply);

export default postRouter;
