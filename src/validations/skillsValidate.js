import Joi from "joi";

export const SkillSchema = Joi.object({
  name: Joi.string().min(2).required(),
  summary: Joi.string().allow("").optional(),
  desc: Joi.string().allow("").optional(),
  level: Joi.number().min(0).max(100).optional(),
  icon: Joi.any().optional(),
});

export const UpdateSkillSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  summary: Joi.string().allow("").optional(),
  desc: Joi.string().allow("").optional(),
  level: Joi.number().min(0).max(100).optional(),
  icon: Joi.any().optional(),
}).min(1);
