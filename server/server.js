import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import verifyJWT from "./middleware/jwtVerify.js";
import { authRouter, postRouter, userRouter } from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "30mb" }));
app.use(morgan("dev"));


app.use("/auth", authRouter);

app.use(verifyJWT);

app.use("/user", userRouter);
app.use("/post", postRouter);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });


app.get("/", (req, res) => {
  res.send("Welcome to the User Posts API!");
});
