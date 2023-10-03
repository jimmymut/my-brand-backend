import Joi from "joi";

const validateMessageSchema = Joi.object({
  contName: Joi.string()
    .min(3)
    .required(),
  contEmail: Joi.string().email().lowercase().required(),
  phone: Joi.string().regex(/^\+\d{1,3}\d{8,14}$/).required(),
  message: Joi.string().min(3).required(),
});

export default validateMessageSchema;
