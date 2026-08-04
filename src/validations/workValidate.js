import Joi from "joi";

const workSchema = Joi.object({
  title: Joi.string().min(3).required(),
  body: Joi.string().allow("").optional(),
  desc: Joi.string().allow("").optional(),
  start: Joi.string().allow("").optional(),
  end: Joi.string().allow("").optional(),
  link: Joi.string().allow("").optional(),
});

const updateWorkSchema = Joi.object()
  .keys({
    title: Joi.string().min(3).optional(),
    body: Joi.string().allow("").optional(),
    desc: Joi.string().allow("").optional(),
    start: Joi.string().allow("").optional(),
    end: Joi.string().allow("").optional(),
    link: Joi.string().allow("").optional(),
  })
  .min(1);

export { workSchema, updateWorkSchema };
