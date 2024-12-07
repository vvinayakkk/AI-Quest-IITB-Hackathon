import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Member" },
  department: { type: String },
  verified: { type: Boolean, default: false },
  reputation: { type: Number, default: 15234 },
  answers: { type: Number, default: 1429 },
  badgesCount: { 
    total: { type: Number, default: 47 },
    gold: { type: Number, default: 12 },
    silver: { type: Number, default: 20 },
    bronze: { type: Number, default: 15 }
  },
  badges: {
    gold: [{
      name: String,
      description: String,
      progress: Number,
      earned: Boolean
    }],
    silver: [{
      name: String,
      description: String,
      progress: Number,
      earned: Boolean
    }]
  },
  avatar: { type: String }, 
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Users = mongoose.model("Users", usersSchema);

export default Users;