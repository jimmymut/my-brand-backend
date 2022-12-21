import Joi from "joi";

const validateMessageSchema = Joi.object({
  contName: Joi.string()
    .regex(/^[A-Z]+ [A-Z]+$/i)
    .min(3)
    .required(),
  contEmail: Joi.string().email().lowercase().required(),
  phone: Joi.string().min(10).max(13).required(),
  message: Joi.string().min(10).required(),
});

export default validateMessageSchema;
