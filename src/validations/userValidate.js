import Joi from "joi";

const SignUpSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).uppercase().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required().strict(),
  comfirmPassword: Joi.string().valid(Joi.ref("password")).required().strict(),
});

const loginSchema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required().strict(),
  })
  .required();

export { SignUpSchema, loginSchema };
