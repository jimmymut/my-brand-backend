import {
  adminSignUpSchema,
  loginSchema,
} from "../validations/adminValidate.js";

const validatedAdminSignUp = async (req, res, next) => {
  const { error, value } = adminSignUpSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      error,
    });
  }
  req.validatedData = value;
  next();
};

const validatedAdminLogin = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      error,
    });
  }
  req.validatedData = value;
  next();
};

export { validatedAdminSignUp, validatedAdminLogin };
