import express from "express";
import {
  checkIsAdmin,
  getAllAdmins,
  getAllAppUsers,
  getNumberAdmins,
  getNumberAllAppUsers,
} from "../../controllers/adminController.js";

const adminRouter = express.Router();


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


export default adminRouter;
