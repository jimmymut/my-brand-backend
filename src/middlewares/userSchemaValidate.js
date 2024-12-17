import * as UserSchemas from "../validations/userValidate.js";

export const validatedUserSignUp = async (req, res, next) => {
  const { error, value } = UserSchemas.SignUpSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  req.validatedData = value;
  next();
};

export const validatedUserLogin = async (req, res, next) => {
  const { error, value } = UserSchemas.loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  req.validatedData = value;
  next();
};

export const validatedChangePassword = async (req, res, next) => {
  const { error, value } = UserSchemas.changePassSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  req.body = value;
  next();
};

export const validatedChangeRole = async (req, res, next) => {
  const { error, value } = UserSchemas.RoleSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  req.body = value;
  next();
};

export const validateRequestPassOtp = async (req, res, next) => {
  const { error, value } = UserSchemas.requestOtpSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  req.body = value;
  next();
};

export const validateResetPassword = async (req, res, next) => {
  const { error, value } = UserSchemas.resetPasswordSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  req.body = value;
  next();
};
