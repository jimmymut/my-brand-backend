import express from "express";
import {
  userSignUp,
  getAllUsers,
  getNumberNonAdminUsers,
} from "../../controllers/userController";
import { authorized } from "../../middlewares/authenticate";
import { isAdmin } from "../../middlewares/isAdmin";
import { validatedUserSignUp } from "../../middlewares/userSchemaValidate";

const userRouter = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a list of all non users
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
 *         description: Should be loggedin and be an admin to get all users
 *       500:
 *         description: Internal error
 */
userRouter.get("/", authorized, isAdmin, getAllUsers);

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
 *         description: Should be loggedin and be an admin to get the number of non admin users
 *       500:
 *         description: Internal error
 */
userRouter.get("/users", authorized, isAdmin, getNumberNonAdminUsers);

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
userRouter.post("/", validatedUserSignUp, userSignUp);

export default userRouter;
