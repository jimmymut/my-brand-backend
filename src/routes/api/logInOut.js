import express from "express";
import { validatedUserLogin } from "../../middlewares/userSchemaValidate";
import { authorized } from "../../middlewares/authenticate";
import { userLogin, userLogOut } from "../../controllers/userController";
import { authUserLogin } from "../../middlewares/authenticate";

const loginout = express.Router();

/**
 * @swagger
 * /login:
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
loginout.post("/login", validatedUserLogin, authUserLogin, userLogin);

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
loginout.post("/logout", authorized, userLogOut);

export default loginout;
