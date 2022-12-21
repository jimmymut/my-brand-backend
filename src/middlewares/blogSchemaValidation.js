import {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
} from "../validations/blogJoiSchema";

const validatedAddBlog = async (req, res, next) => {
  const { error, value } = validateAddBlogSchema.validate(req.body, {
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
const validatedUpdateBlog = async (req, res, next) => {
  const { error, value } = validateUpdateBlogSchema.validate(req.body, {
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
const validatedAddComment = async (req, res, next) => {
  const { error, value } = validateBlogCommentSchema.validate(req.body, {
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

export { validatedAddBlog, validatedUpdateBlog, validatedAddComment };
