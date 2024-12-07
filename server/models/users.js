import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String }, // Optional: Add avatar field for profile pictures
  createdAt: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", usersSchema);

export default Users;
