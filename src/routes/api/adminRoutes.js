import express from "express";
import {
  adminSignUp,
  checkIsAdmin,
  deleteUserAccount,
  getAllAdmins,
  getAllAppUsers,
  getNumberAdmins,
  getNumberAllAppUsers,
} from "../../controllers/adminController.js";
import { validatedUserSignUp } from "../../middlewares/userSchemaValidate.js";

const adminRouter = express.Router();

/**
 * @swagger
 * /admins:
 *   post:
 *     tags:
 *       - Admins
 *     summary: Create an admin account
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UserSignUp'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Account exist or invalid information provided
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to create a new admin account
 *       500:
 *         description: Internal error
 */
adminRouter.post("/", validatedUserSignUp, adminSignUp);

/**
 * @swagger
 * /admins:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get a list of all admins
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: A list of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to get all admins
 *       500:
 *         description: Internal error
 */
adminRouter.get("/", getAllAdmins);

/**
 * @swagger
 * /admins/admins:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get the number of admins
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
 *                  Admins:
 *                      type: number
 *                      default: 0
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to get the number of admins
 *       500:
 *         description: Internal error
 */
adminRouter.get("/admins", getNumberAdmins);

adminRouter.get("/dashboard", checkIsAdmin);

/**
 * @swagger
 * /admins/users:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get a list of all app users
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: A list of all app users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to get all app users
 *       500:
 *         description: Internal error
 */
adminRouter.get("/users", getAllAppUsers);

/**
 * @swagger
 * /admins/users/users:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get the number of app users
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
 *                  Users:
 *                      type: number
 *                      default: 0
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to get the number all app users
 *       500:
 *         description: Internal error
 */
adminRouter.get("/users/users", getNumberAllAppUsers);

/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     tags:
 *       - Admins
 *     summary: Deleting any user account
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of a specific user account
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 type: string
 *                 default: Account deleted
 *       400:
 *         description: Invalid mongoose id
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to delete a user account
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal error
 */
adminRouter.delete("/:id", deleteUserAccount);

export default adminRouter;
