import { SignUpSchema, changePassSchema, loginSchema } from "../validations/userValidate.js";

export const validatedUserSignUp = async (req, res, next) => {
  const { error, value } = SignUpSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

export const validatedUserLogin = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

export const validatedChangePassword = async (req, res, next) => {
  const { error, value } = changePassSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.body = value;
  next();
};

