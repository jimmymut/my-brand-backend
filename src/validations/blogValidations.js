import Joi from "joi";

const validateAddBlogSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().min(100).required(),
  file: Joi.any().required(),
  likes: Joi.array(),
  comments: Joi.array(),
});
const validateUpdateBlogSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().min(100),
  file: Joi.string(),
}).min(1);
const validateBlogCommentSchema = Joi.object({
  comment: Joi.string().min(10).required(),
});

export {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
};
