import { SkillSchema, UpdateSkillSchema } from "../validations/skillsValidate";

export const validateSkill = async (req, res, next) => {
  const { error, value } = SkillSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

export const validateUpdateSkill = async (req, res, next) => {
  const { error, value } = UpdateSkillSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};
