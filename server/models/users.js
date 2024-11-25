import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  id: { type: Number},
  username: { type: String},
  avatar: { type: String },
  time: { type: String }, // Can be `Date` if needed.
  content: { type: String  },
  votes: { type: Number, default: 0 },
  category: { type: String  },
  tags: { type: [String], default: [] },
  replies: [
    {
      id: { type: Number},
      username: { type: String },
      content: { type: String},
      time: { type: String}, // Can be `Date`.
    },
  ],
});

const Users = mongoose.model("Users", usersSchema);

export default Users;
