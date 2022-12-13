import {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
} from "../validations/blogValidations";
import mongoose from "mongoose";

const validatedAddBlog = async (req, res, next) => {
  const { error, value } = validateAddBlogSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.details);
  }
  req.validatedData = value;
  next();
};
const validatedUpdateBlog = async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const { error, value } = validateUpdateBlogSchema.validate(
    {
      id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      file: req.body.file,
    },
    {
      abortEarly: false,
    }
  );
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};
const validatedAddComment = async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const { error, value } = validateBlogCommentSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).send(error.message);
  }
  req.validatedData = value;
  next();
};

export { validatedAddBlog, validatedUpdateBlog, validatedAddComment };
