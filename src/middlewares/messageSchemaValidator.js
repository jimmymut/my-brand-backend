import validateMessageSchema from "../validations/messageValidate.js";

const validatedMessage = async (req, res, next) => {
  const { error, value } = validateMessageSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

export default validatedMessage;
