import mongoose from "mongoose";

const userGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    type: {
      type: String,
      enum: ["public", "private", "restricted"],
      default: "public",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["owner", "admin", "moderator"],
        default: "admin",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["member", "moderator"],
        default: "member",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["active", "muted", "banned"],
        default: "active",
      },
    }],
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
      allowMemberPosts: {
        type: Boolean,
        default: true,
      },
      allowMemberComments: {
        type: Boolean,
        default: true,
      },
      allowMemberReactions: {
        type: Boolean,
        default: true,
      },
      allowMemberSharing: {
        type: Boolean,
        default: true,
      },
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userGroupSchema.index({ name: 1 });
userGroupSchema.index({ type: 1 });
userGroupSchema.index({ tags: 1 });
userGroupSchema.index({ "members.user": 1 });
userGroupSchema.index({ "admins.user": 1 });

// Methods
userGroupSchema.methods.addMember = async function(userId, role = "member") {
  if (!this.members.some(member => member.user.toString() === userId.toString())) {
    this.members.push({
      user: userId,
      role,
    });
    await this.save();
  }
};

userGroupSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );
  await this.save();
};

userGroupSchema.methods.updateMemberRole = async function(userId, newRole) {
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  if (member) {
    member.role = newRole;
    await this.save();
  }
};

userGroupSchema.methods.addAdmin = async function(userId, role = "admin") {
  if (!this.admins.some(admin => admin.user.toString() === userId.toString())) {
    this.admins.push({
      user: userId,
      role,
    });
    await this.save();
  }
};

userGroupSchema.methods.removeAdmin = async function(userId) {
  this.admins = this.admins.filter(
    admin => admin.user.toString() !== userId.toString()
  );
  await this.save();
};

userGroupSchema.methods.updateAdminRole = async function(userId, newRole) {
  const admin = this.admins.find(
    admin => admin.user.toString() === userId.toString()
  );
  if (admin) {
    admin.role = newRole;
    await this.save();
  }
};

// Static methods
userGroupSchema.statics.findByUser = function(userId) {
  return this.find({
    "members.user": userId,
    status: "active",
  }).sort({ updatedAt: -1 });
};

userGroupSchema.statics.findPublic = function() {
  return this.find({
    type: "public",
    status: "active",
  }).sort({ updatedAt: -1 });
};

const UserGroup = mongoose.model("UserGroup", userGroupSchema);

export default UserGroup; 