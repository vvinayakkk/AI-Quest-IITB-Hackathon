import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import {authRouter,userRouter} from "./routes/index.js";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: "*",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
// Routes

app.use("/auth", authRouter);
app.use('/user',userRouter);
// Connect to MongoDB

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the User Posts API!");
});
