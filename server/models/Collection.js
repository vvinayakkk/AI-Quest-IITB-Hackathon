import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    type: {
      type: String,
      enum: ["collection", "bookmark", "reading_list"],
      default: "collection",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "shared"],
      default: "private",
    },
    items: [{
      type: {
        type: String,
        enum: ["post", "comment", "user"],
        required: true,
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "items.type",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
      notes: {
        type: String,
        trim: true,
        maxLength: 500,
      },
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    collaborators: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["viewer", "editor", "admin"],
        default: "viewer",
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
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
collectionSchema.index({ user: 1, type: 1 });
collectionSchema.index({ visibility: 1 });
collectionSchema.index({ tags: 1 });
collectionSchema.index({ "items.item": 1 });

// Methods
collectionSchema.methods.addItem = async function(itemType, itemId, notes = "") {
  if (!this.items.some(item => item.type === itemType && item.item.toString() === itemId.toString())) {
    this.items.push({
      type: itemType,
      item: itemId,
      notes,
    });
    await this.save();
  }
};

collectionSchema.methods.removeItem = async function(itemType, itemId) {
  this.items = this.items.filter(
    item => !(item.type === itemType && item.item.toString() === itemId.toString())
  );
  await this.save();
};

collectionSchema.methods.addCollaborator = async function(userId, role = "viewer") {
  if (!this.collaborators.some(collab => collab.user.toString() === userId.toString())) {
    this.collaborators.push({
      user: userId,
      role,
    });
    await this.save();
  }
};

collectionSchema.methods.removeCollaborator = async function(userId) {
  this.collaborators = this.collaborators.filter(
    collab => collab.user.toString() !== userId.toString()
  );
  await this.save();
};

collectionSchema.methods.updateCollaboratorRole = async function(userId, newRole) {
  const collaborator = this.collaborators.find(
    collab => collab.user.toString() === userId.toString()
  );
  if (collaborator) {
    collaborator.role = newRole;
    await this.save();
  }
};

// Static methods
collectionSchema.statics.findByUser = function(userId, type = null) {
  const query = { user: userId, status: "active" };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

collectionSchema.statics.findPublic = function(type = null) {
  const query = { visibility: "public", status: "active" };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection; 