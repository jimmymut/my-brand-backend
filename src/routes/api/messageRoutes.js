import express from "express";
import {
  getAllMessages,
  contactMe,
  singleMessage,
  deleteMessage,
  getNumberMessages,
} from "../../controllers/messagesController.js";
import validatedMessage from "../../middlewares/messageSchemaValidator.js";
import { authorized } from "../../middlewares/authenticate.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

const msgRouter = express.Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get a list of all contact messages
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Should be loggedin and be an admin to get all messages
 *       500:
 *         description: Server error
 */
msgRouter.get("/", authorized, isAdmin, getAllMessages);

/**
 * @swagger
 * /messages/messages:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get the number of all messages
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
 *                  messages:
 *                      type: number
 *                      default: 0
 *       401:
 *         description: Should be loggedin and be an admin to get the number of messages
 *       500:
 *         description: Server error
 */
msgRouter.get("/messages", authorized, isAdmin, getNumberMessages);

/**
 * @swagger
 * /messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/MessageSend'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid information provided
 *       500:
 *         description: Internal error
 */
msgRouter.post("/", validatedMessage, contactMe);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get a single message
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of a specific message
 *         required: true
 *     responses:
 *       200:
 *         description: Content of a messages
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid mongoose id
 *       404:
 *         description: message not found
 *       401:
 *         description: Should be loggedin and be an admin to get a single message
 *       500:
 *         description: Internal error
 */
msgRouter.get("/:id", authorized, isAdmin, singleMessage);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Delete a message
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of a specific message
 *         required: true
 *     responses:
 *       204:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 type: string
 *                 default: Message deleted
 *       400:
 *         description: Invalid mongoose id
 *       404:
 *         description: Message not found
 *       401:
 *         description: Should be loggedin and be an admin to delete a message
 *       500:
 *         description: Internal error
 */
msgRouter.delete("/:id", authorized, isAdmin, deleteMessage);

export default msgRouter;
