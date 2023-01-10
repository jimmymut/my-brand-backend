import { SignUpSchema, loginSchema } from "../validations/userValidate.js";

const validatedUserSignUp = async (req, res, next) => {
  const { error, value } = SignUpSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

const validatedUserLogin = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

export { validatedUserSignUp, validatedUserLogin };
