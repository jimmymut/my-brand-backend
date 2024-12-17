import Joi from "joi";

export const SignUpSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).uppercase().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).max(30).required().strict(),
  comfirmPassword: Joi.string().valid(Joi.ref("password")).required().strict(),
});

export const loginSchema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(30).required().strict(),
  })
  .required();

export const changePassSchema = Joi.object({
  old: Joi.string().min(5).max(30).required().strict(),
  newPwd: Joi.string().min(5).max(30).required().strict(),
});

export const RoleSchema = Joi.object({
  title: Joi.string().valid("user", "admin").required().strict(),
});

export const requestOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+/)
    .required()
    .messages({ "string.pattern": "The OTP must be six digits" }),
  password: Joi.string().min(5).max(30).required().strict(),
});
