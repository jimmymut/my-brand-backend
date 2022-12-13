import express from "express";
import {
  adminSignUp,
  deleteUserAccount,
  getAllAdmins,
  getAllAppUsers,
  getNumberAdmins,
  getNumberAllAppUsers,
} from "../../controllers/adminController";
import { authorized } from "../../middlewares/authenticate";
import { isAdmin } from "../../middlewares/isAdmin";
import { validatedUserSignUp } from "../../middlewares/userSchemaValidate";

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
 *         description: Should be loggedin and be an admin to create a new admin account
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
 *         description: Should be loggedin and be an admin to get all admins
 *       500:
 *         description: Internal error
 */
adminRouter.get("/", authorized, isAdmin, getAllAdmins);

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
 *         description: Should be loggedin and be an admin to get the number of admins
 *       500:
 *         description: Internal error
 */
adminRouter.get("/admins", authorized, isAdmin, getNumberAdmins);

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
 *         description: Should be loggedin and be an admin to get all app users
 *       500:
 *         description: Internal error
 */
adminRouter.get("/users", authorized, isAdmin, getAllAppUsers);

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
 *         description: Should be loggedin and be an admin to get the number all app users
 *       500:
 *         description: Internal error
 */
adminRouter.get("/users/users", authorized, isAdmin, getNumberAllAppUsers);

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
 *       404:
 *         description: Account not found
 *       401:
 *         description: Should be loggedin and be an admin to delete a user account
 *       500:
 *         description: Internal error
 */
adminRouter.delete("/:id", authorized, isAdmin, deleteUserAccount);

export default adminRouter;
