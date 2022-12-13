import Joi from "joi";

const validateAddBlogSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().min(100).required(),
  file: Joi.any().required(),
});
const validateUpdateBlogSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string(),
  description: Joi.string().min(100),
  file: Joi.string(),
});
const validateBlogCommentSchema = Joi.object({
  name: Joi.string()
    .regex(/^[A-Z]+ [A-Z]+$/i)
    .min(3)
    .required(),
  comment: Joi.string().min(10).required(),
});

export {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
};
