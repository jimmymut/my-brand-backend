import Joi from "joi";

const workSchema = Joi.object({
  title: Joi.string().min(10).required(),
  body: Joi.string().min(40).required(),
});

const updateWorkSchema = Joi.object()
  .keys({
    title: Joi.string().min(10).optional(),
    body: Joi.string().min(40).optional()
  })
  .min(1);

export { workSchema, updateWorkSchema };
