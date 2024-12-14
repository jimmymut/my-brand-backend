import Joi from "joi";

const GoogleSchema = Joi.object({
  code: Joi.string().min(3).required(),
});

export default GoogleSchema;
