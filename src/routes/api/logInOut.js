import express from "express";
import { validatedUserLogin } from "../../middlewares/userSchemaValidate.js";
import { authorized } from "../../middlewares/authenticate.js";
import { UserController } from "../../controllers/userController.js";
import { authUserLogin } from "../../middlewares/authenticate.js";

const loginout = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login for all app users
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                  email:
 *                      type: string
 *                      default: mutabazijimmy9@gmail.com
 *                  password:
 *                      type: string
 *                      default: password
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  LoggedIn:
 *                      type: string
 *                      default: Success
 *                  token:
 *                      type: string
 *       400:
 *         description: Invalid information provided
 *       401:
 *         description: Authentication failure
 *       500:
 *         description: Internal error
 */
loginout.post("/auth/login", validatedUserLogin, authUserLogin, UserController.userLogin);

/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Logout for all app users
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
 *                  Message:
 *                      type: string
 *                      default: logged out!
 *       401:
 *         description: You are not logged in
 *       500:
 *         description: Internal error
 */
loginout.post("/logout", authorized, UserController.userLogOut);

export default loginout;
