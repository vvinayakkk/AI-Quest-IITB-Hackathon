import express from "express";
import { getAllPosts, registerUser, getAllUsers, getNumberOfAnswers , addPost , addReply } from "../controllers/users.js";

const router = express.Router();

router.get("/posts", getAllPosts);
router.post("/register", registerUser);
router.get("/users", getAllUsers);
router.get("/answers/count", getNumberOfAnswers);
router.post("/posts", addPost);
router.post("/posts/:postId/replies", addReply);

export default router;
