import Joi from "joi";

export const SkillSchema = Joi.object({
  name: Joi.string().min(6).required(),
  summary: Joi.string().min(100).required(),
  icon: Joi.any().required(),
});

export const UpdateSkillSchema = Joi.object({
  name: Joi.string().min(6).optional(),
  summary: Joi.string().min(100).optional(),
  icon: Joi.any().optional(),
}).min(1);
