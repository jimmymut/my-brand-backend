import express from "express";
import {
  UserController,
} from "../../controllers/userController.js";
import { authorized, authorizeOtp, authorizeVerifyEmail } from "../../middlewares/authenticate.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import * as userValidation from "../../middlewares/userSchemaValidate.js";
import { validateGoogle } from "../../middlewares/googleValidator.js";
import { limitThreeRequestsInOneHour } from "../../middlewares/rateLimiter.js";

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
 *       - Admins
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
userRouter.post("/", userValidation.validatedUserSignUp, UserController.userSignUp);

userRouter.post('/auth/google', validateGoogle, UserController.googleAuth);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Change password
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  old:
 *                    type: string
 *                    default: 12345!
 *                  newPwd:
 *                    type: string
 *                    default: 12345!
 *                required:
 *                  - old
 *                  - newPwd
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      default: Password changed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbbiden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
*/
userRouter.patch("/change-password", limitThreeRequestsInOneHour, authorized, userValidation.validatedChangePassword, UserController.changePassword);

userRouter.get("/verify-email", authorizeVerifyEmail, UserController.verifyEmail);

/**
 * @swagger
 * /users/resend-verification:
 *   get:
 *     tags:
 *       - Users
 *     summary: Request resend verification email
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
 *                  message:
 *                      type: string
 *                      default: Verification email is successfull sent, check your email
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not logged
 *       429:
 *         description: Manay requests
 *       500:
 *         description: Server error
 */
userRouter.get("/resend-verification", limitThreeRequestsInOneHour, authorized, UserController.resendVerificationEmail);

/**
 * @swagger
 * /users/request-otp:
 *   post:
 *     tags:
 *       - Users
 *     summary: Request reset password otp
  *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    default: mutabazijimmy9@gmail.com
 *                required:
 *                  - email
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      default: Verification email is successfull sent, check your email
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not logged
 *       429:
 *         description: Manay requests
 *       500:
 *         description: Server error
 */
userRouter.post("/request-otp", limitThreeRequestsInOneHour, userValidation.validateRequestPassOtp, UserController.requestPasswordOtp);

userRouter.get("/:id", UserController.getSingleUser);

/**
 * @swagger
 * /users/reset-password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Change user role/title
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  otp:
 *                    type: string
 *                    default: 123456
 *                  password:
 *                    type: string
 *                    default: password
 *                required:
 *                  - otp
 *                  - password
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      default: Password is successifull changed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbbiden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
*/
userRouter.patch("/reset-password", authorizeOtp, userValidation.validateResetPassword, UserController.resetPassword);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags:
 *       - Admins
 *     summary: Change user role/title
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  title:
 *                    type: enum
 *                    enum: ["admin","user"]
 *                    default: admin
 *                required:
 *                  - title
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      default: User role changed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbbiden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
*/
userRouter.patch("/:id", authorized, isAdmin, userValidation.validatedChangeRole, UserController.changeRole);

export default userRouter;
