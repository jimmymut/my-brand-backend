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
    title: Joi.string().valid(["user", "admin"]).required().strict(),
  });
