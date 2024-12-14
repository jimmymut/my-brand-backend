import GoogleSchema from "../validations/google";

export const validateGoogle = async (req, res, next) => {
  const { error, value } = GoogleSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({message: error.message});
  }
  req.body = value;
  next();
};
