import Joi from "joi";

const validateAddBlogSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow("").optional(),
  excerpt: Joi.string().allow("").optional(),
  tag: Joi.string().allow("").optional(),
  body: Joi.array().items(Joi.string().allow("")).optional(),
  date: Joi.string().allow("").optional(),
  file: Joi.any().allow(null, "").optional(),
});
const validateUpdateBlogSchema = Joi.object({
  title: Joi.string().min(3).optional(),
  description: Joi.string().allow("").optional(),
  excerpt: Joi.string().allow("").optional(),
  tag: Joi.string().allow("").optional(),
  body: Joi.array().items(Joi.string().allow("")).optional(),
  date: Joi.string().allow("").optional(),
  file: Joi.any().allow(null, "").optional().meta({ swaggerType: "file" }),
}).min(1);
const validateBlogCommentSchema = Joi.object({
  comment: Joi.string().min(2).required(),
});

export {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
};
