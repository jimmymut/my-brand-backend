import { workSchema, updateWorkSchema } from "../validations/workValidate";

export const validateWork = async (req, res, next) => {
  const { error, value } = workSchema.validate(req.body, {
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

export const validateUpdateWork = async (req, res, next) => {
  const { error, value } = updateWorkSchema.validate(req.body, {
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
