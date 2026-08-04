import {
  validateAddBlogSchema,
  validateUpdateBlogSchema,
  validateBlogCommentSchema,
} from "../validations/blogValidations.js";
import mongoose from "mongoose";

// Over multipart/form-data the `body` paragraph array arrives as a JSON string;
// parse it back into an array before validation.
const parseBody = (val) => {
  if (typeof val !== "string") return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : val;
  } catch {
    return val;
  }
};

const validatedAddBlog = async (req, res, next) => {
  const data = {
    title: req.body.title,
    description: req.body.description,
    excerpt: req.body.excerpt,
    tag: req.body.tag,
    body: parseBody(req.body.body),
    date: req.body.date,
    file: req.file ? req.file.path : req.body.file,
  };
  const { error, value } = validateAddBlogSchema.validate(data, {
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

const validatedUpdateBlog = async (req, res, next) => {
  const id = req.params.id;
  if (req.body.body !== undefined) req.body.body = parseBody(req.body.body);
  const { error, value } = validateUpdateBlogSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid id",
    });
  }
  req.validatedData = value;
  next();
};

const validatedAddComment = async (req, res, next) => {
  const id = req.params.id;
  const { error, value } = validateBlogCommentSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid id",
    });
  }
  req.validatedData = value;
  next();
};

export { validatedAddBlog, validatedUpdateBlog, validatedAddComment };
