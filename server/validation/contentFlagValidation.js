import Joi from "joi";

export const createFlagSchema = Joi.object({
  contentType: Joi.string().required(),
  contentId: Joi.string().required(),
  reason: Joi.string().required(),
  description: Joi.string().max(1000),
  priority: Joi.string().valid("low", "medium", "high", "urgent"),
});

export const resolveFlagSchema = Joi.object({
  resolution: Joi.string().required(),
  action: Joi.string().valid("warn", "delete", "ban", "none").required(),
  notes: Joi.string().max(1000),
});

export const updateFlagPrioritySchema = Joi.object({
  priority: Joi.string().valid("low", "medium", "high", "urgent").required(),
}); 