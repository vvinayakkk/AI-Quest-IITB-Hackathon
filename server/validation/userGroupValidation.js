import Joi from "joi";

export const createGroupSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  type: Joi.string().valid("public", "private", "restricted").required(),
  settings: Joi.object({
    allowInvites: Joi.boolean(),
    requireApproval: Joi.boolean(),
    maxMembers: Joi.number().min(1),
  }),
  tags: Joi.array().items(Joi.string()),
});

export const updateGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500),
  type: Joi.string().valid("public", "private", "restricted"),
  settings: Joi.object({
    allowInvites: Joi.boolean(),
    requireApproval: Joi.boolean(),
    maxMembers: Joi.number().min(1),
  }),
  tags: Joi.array().items(Joi.string()),
});

export const addMemberSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid("member", "moderator").required(),
});

export const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid("member", "moderator").required(),
});

export const addAdminSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid("admin", "super_admin").required(),
});

export const updateAdminRoleSchema = Joi.object({
  role: Joi.string().valid("admin", "super_admin").required(),
}); 