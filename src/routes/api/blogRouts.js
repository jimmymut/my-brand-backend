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
import passport from "passport";

const blogRouter = express.Router();

blogRouter.get("/", getAllBlogs);

blogRouter.post("/", passport.authenticate("jwt", { session: false }), validatedAddBlog, addBlog);

blogRouter.get("/:id", getSingleBlog);

blogRouter.patch("/:id", passport.authenticate("jwt", { session: false }), validatedUpdateBlog, updateBlog);

blogRouter.get("/:id/comments", allComments);
blogRouter.post("/:id/comments", validatedAddComment, addComment);

blogRouter.delete("/:id", passport.authenticate("jwt", { session: false }), deleteBlog);
blogRouter.patch("/:id/likes", likeBlog);
blogRouter.get("/:id/likes", likesOnBlog);

export default blogRouter;
