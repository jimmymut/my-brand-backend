import express from "express";
import {
  getAllBlogs,
  addBlog,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  addComment,
  likeBlog,
  allComments,
  likesOnBlog,
} from "../../controllers/blogController";
import {
  validatedAddBlog,
  validatedUpdateBlog,
  validatedAddComment,
} from "../../middlewares/blogSchemaValidation";
import upload from "../../utils/multer";
import { authorized, authorizedUser } from "../../middlewares/authenticate";
import { isAdmin, isNotAdmin } from "../../middlewares/isAdmin";

const blogRouter = express.Router();

blogRouter.get("/", getAllBlogs);

blogRouter.post(
  "/",
  authorized,
  isAdmin,
  upload.single("file"),
  validatedAddBlog,
  addBlog
);
blogRouter.get("/:id", getSingleBlog);

blogRouter.patch("/:id", authorized, isAdmin, validatedUpdateBlog, updateBlog);

blogRouter.get("/:id/comments", allComments);
blogRouter.post("/:id/comments", validatedAddComment, addComment);

blogRouter.delete("/:id", authorized, isAdmin, deleteBlog);
blogRouter.put("/:id/likes", authorized, isNotAdmin, likeBlog);
blogRouter.get("/:id/likes", likesOnBlog);

export default blogRouter;
