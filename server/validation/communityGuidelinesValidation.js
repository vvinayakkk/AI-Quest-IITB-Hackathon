import Joi from "joi";

export const createGuidelinesSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  content: Joi.string().required(),
  category: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high").required(),
});

export const updateGuidelinesSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string(),
  category: Joi.string(),
  priority: Joi.string().valid("low", "medium", "high"),
}); 