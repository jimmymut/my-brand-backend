import express from "express";
import {
  UserController,
} from "../../controllers/userController.js";
import { authorized } from "../../middlewares/authenticate.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import { validatedUserSignUp } from "../../middlewares/userSchemaValidate.js";

const userRouter = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a list of all non admin users
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to get all users
 *       500:
 *         description: Internal error
 */
userRouter.get("/", authorized, isAdmin, UserController.getAllUsers);

/**
 * @swagger
 * /users/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the number of non admin users
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  numNotAdmin:
 *                      type: number
 *                      default: 0
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to get the number of non admin users
 *       500:
 *         description: Internal error
 */
userRouter.get("/users", authorized, isAdmin, UserController.getNumberNonAdminUsers);

userRouter.get("/dashboard", authorized, UserController.isUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user's name and email
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  name:
 *                      type: string
 *                      default: Jimmy
 *                  email:
 *                      type: string
 *                      default: mutabazijimmy9@gmail.com
 *       401:
 *         description: not logged in
 *       500:
 *         description: Internal error
 */
userRouter.get("/profile", authorized, UserController.userProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a single user
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of a specific user
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Non mongoose id
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal error
 */
userRouter.get("/dashboard", authorized, UserController.isUser);

userRouter.get("/:id", UserController.getSingleUser);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a user account
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UserSignUp'
 *     responses:
 *       200:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Account exist or invalid information
 *       500:
 *         description: Server error
 */
userRouter.post("/", validatedUserSignUp, UserController.userSignUp);

userRouter.post('/auth/google', UserController.googleAuth);

export default userRouter;
