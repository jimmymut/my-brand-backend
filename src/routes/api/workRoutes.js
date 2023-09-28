import express from "express";
import { createWork, updateWork, getAllWorks, deleteWork } from "../../controllers/workController";
import { isAdmin } from "../../middlewares/isAdmin";
import { authorized } from "../../middlewares/authenticate";
import { validateUpdateWork, validateWork } from "../../middlewares/workValidator";

const workRouter = express.Router();

/**
 * @swagger
 * /works:
 *   get:
 *     tags:
 *       - Work
 *     summary: Get a list of all work done
 *     responses:
 *       200:
 *         description: A list of work done
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkResponse'
 *       500:
 *         description: Server error
 */
workRouter.get("/", getAllWorks);

/**
 * @swagger
 * /works:
 *   post:
 *     tags:
 *       - Work
 *     summary: Add a work
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/CreateWork'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/WorkResponse'
 *       401:
 *         description: Unauthorized!
 *       400:
 *         description: Invalid information provided
 *       403:
 *         description: no permissions
 *       409:
 *         description: comflict
 *       500:
 *         description: Internal error
 */
workRouter.post("/", authorized, isAdmin, validateWork, createWork);

/**
 * @swagger
 * /works/{id}:
 *   patch:
 *     tags:
 *       - Work
 *     summary: Update work
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of a specific a work
 *         required: true
 *     requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateWork'
 *     responses:
 *       200:
 *         description: Content of a messages
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Invalid mongoose id
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to update a work
 *       404:
 *         description: work not found
 *       500:
 *         description: Internal error
 */
workRouter.patch("/:id", authorized, isAdmin, validateUpdateWork, updateWork);

/**
 * @swagger
 * /works/{id}:
 *   delete:
 *     tags:
 *       - Work
 *     summary: Delete work
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
 *                 default: Work deleted
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to delete a message
 *       404:
 *         description: Work not found
 *       500:
 *         description: Internal error
 */
workRouter.delete("/:id", authorized, isAdmin, deleteWork);

export default workRouter;
