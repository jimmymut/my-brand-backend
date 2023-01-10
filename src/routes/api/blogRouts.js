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
  deleteComment,
  numberOfBlogComments,
  getNumberAllBlogs,
  getSingleComment,
} from "../../controllers/blogController.js";
import {
  validatedAddBlog,
  validatedUpdateBlog,
  validatedAddComment,
} from "../../middlewares/blogSchemaValidation.js";
import upload from "../../utils/multer.js";
import { authorized } from "../../middlewares/authenticate.js";
import { isAdmin, isNotAdmin } from "../../middlewares/isAdmin.js";

const blogRouter = express.Router();

/**
 * @swagger
 * /blogs:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get a list of all blogs
 *     responses:
 *       200:
 *         description: A list of all blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlogResponse'
 *       500:
 *         description: Internal error
 */
blogRouter.get("/", getAllBlogs);

/**
 * @swagger
 * /blogs:
 *   post:
 *     tags:
 *       - Blogs
 *     summary: Create a blog
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/CreateBlog'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 *       400:
 *         description: invalid information provided
 *       401:
 *         description: Should be loggedin and be an admin to create a blog
 *       500:
 *         description: Internal error
 */
blogRouter.post(
  "/",
  authorized,
  isAdmin,
  upload.single("file"),
  validatedAddBlog,
  addBlog
);

/**
 * @swagger
 * /blogs/blogs:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get the number of all blogs
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  Blogs:
 *                      type: number
 *                      default: 0
 *       500:
 *         description: Internal error
 */
blogRouter.get("/blogs", getNumberAllBlogs);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get a single blog
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Content of a blog
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/BlogResponse'
 *       400:
 *         description: Invalid mongoose id
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal error
 */
blogRouter.get("/:id", getSingleBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   patch:
 *     tags:
 *       - Blogs
 *     summary: Update/Edit a blog
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UpdateBlog'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogResponse'
 *       400:
 *         description: invalid information provided, you need to provide at least one of the options
 *       404:
 *         description: Blog doesn't exist
 *       401:
 *         description: Should be loggedin and be an admin to edit a blog
 *       500:
 *         description: Internal error
 */
blogRouter.patch("/:id", authorized, isAdmin, validatedUpdateBlog, updateBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     tags:
 *       - Blogs
 *     summary: Delete a blog
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     responses:
 *       204:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  Message:
 *                      type: string
 *                      default: Blog deleted
 *       400:
 *         description: invalid blog id
 *       404:
 *         description: Blog doesn't exist
 *       401:
 *         description: Should be loggedin and be an admin to delete a blog
 *       500:
 *         description: Internal error
 */
blogRouter.delete("/:id", authorized, isAdmin, deleteBlog);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get a list of all comments on a blog
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Content of a blog
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: Invalid blog id
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal error
 */
blogRouter.get("/:id/comments", allComments);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   post:
 *     tags:
 *       - Blogs
 *     summary: Add a comment on a blog
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/addComment'
 *     responses:
 *       200:
 *         description: Comment added and saved in the database
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: Invalid information provided
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal error
 */
blogRouter.post("/:id/comments", authorized, validatedAddComment, addComment);

/**
 * @swagger
 * /blogs/{id}/comments/comments:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get the number of comments on a blog
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  comments:
 *                      type: number
 *                      default: 0
 *       400:
 *         description: Invalid blog id
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal error
 */
blogRouter.get("/:id/comments/comments", numberOfBlogComments);

/**
 * @swagger
 * /blogs/{id}/comments/{commentId}:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get a single blog comment
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *       - name: commentId
 *         in: path
 *         description: A unique comment identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: invalid blog or comment id
 *       401:
 *         description: Not logged in
 *       404:
 *         description: Blog or comment doesn't exist
 *       500:
 *         description: Internal error
 */
blogRouter.get("/:id/comments/:commentId", getSingleComment);

/**
 * @swagger
 * /blogs/{id}/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Blogs
 *     summary: Delete a blog comment
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *       - name: commentId
 *         in: path
 *         description: A unique comment identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               default: Comment deleted
 *       400:
 *         description: invalid blog or comment id
 *       404:
 *         description: Blog doesn't exist
 *       401:
 *         description: Should be loggedin and be an admin to delete a blog comment
 *       500:
 *         description: Internal error
 */
blogRouter.delete(
  "/:id/comments/:commentId",
  authorized,
  isAdmin,
  deleteComment
);

/**
 * @swagger
 * /blogs/{id}/likes:
 *   put:
 *     tags:
 *       - Blogs
 *     summary: Like/Unlike a blog
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  likes:
 *                      type: number
 *                      default: 0
 *       400:
 *         description: Invalid blog id
 *       401:
 *         description: You have to be logged in and not admin to like a blog
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal error
 */
blogRouter.put("/:id/likes", authorized, isNotAdmin, likeBlog);

/**
 * @swagger
 * /blogs/{id}/likes:
 *   get:
 *     tags:
 *       - Blogs
 *     summary: Get the number of likes on a blog
 *     parameters:
 *       - name: id
 *         in: path
 *         description: A unique blog identifier
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  likes:
 *                      type: number
 *                      default: 0
 *       400:
 *         description: Invalid blog id
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal error
 */
blogRouter.get("/:id/likes", likesOnBlog);

export default blogRouter;
