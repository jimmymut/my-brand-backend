import {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
} from "../validations/blogValidations.js";
import mongoose from "mongoose";

const validatedAddBlog = async (req, res, next) => {
    const data = {
      title: req.body.title,
      description: req.body.description,
      file: req.file.path,
    };
    const { error, value } = validateAddBlogSchema.validate(data, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).send(error.message);
    }
    req.validatedData = value;
    next();
};

const validatedUpdateBlog = async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
    const { error, value } = validateUpdateBlogSchema.validate(req.body, {
      abortEarly: false,
    });
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
