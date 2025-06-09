import Joi from "joi";

export const createCollectionSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  type: Joi.string().valid("bookmark", "reading_list", "custom").required(),
  visibility: Joi.string().valid("public", "private", "shared").required(),
  tags: Joi.array().items(Joi.string()),
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500),
  type: Joi.string().valid("bookmark", "reading_list", "custom"),
  visibility: Joi.string().valid("public", "private", "shared"),
  tags: Joi.array().items(Joi.string()),
});

export const addItemSchema = Joi.object({
  itemId: Joi.string().required(),
  itemType: Joi.string().required(),
  metadata: Joi.object(),
});

export const addCollaboratorSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid("viewer", "editor", "admin").required(),
});

export const updateCollaboratorRoleSchema = Joi.object({
  role: Joi.string().valid("viewer", "editor", "admin").required(),
}); 