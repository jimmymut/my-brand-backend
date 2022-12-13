import Joi from "joi";

const adminSignUpSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required().strict(),
  comfirmPassword: Joi.string().valid(Joi.ref("password")).required().strict(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required().strict(),
});

export { adminSignUpSchema, loginSchema };
