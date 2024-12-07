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

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/new", createPost);
router.put("/:id/update", updatePost);
router.put("/:id/delete", deletePost);
router.post("/:id/like", toggleLike);
router.post("/:id/comment", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
