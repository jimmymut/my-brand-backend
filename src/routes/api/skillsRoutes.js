import express from "express";
import { isAdmin } from "../../middlewares/isAdmin";
import { authorized } from "../../middlewares/authenticate";
import { createSkill, updateSkill, getAllSkills, deleteSkill } from "../../controllers/skillsControllers";
import { validateSkill, validateUpdateSkill } from "../../middlewares/skillValidator";
import upload from "../../utils/multer";

const skillRouter = express.Router();

/**
 * @swagger
 * /skills:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get a list of all skills
 *     responses:
 *       200:
 *         description: A list of skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SkillResponse'
 *       500:
 *         description: Server error
 */
skillRouter.get("/", getAllSkills);

/**
 * @swagger
 * /skills:
 *   post:
 *     tags:
 *       - Skills
 *     summary: Add a skill
 *     security:
 *       - jwt: []
 *     requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *                 $ref: '#/components/schemas/CreateSkill'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/SkillResponse'
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
skillRouter.post("/", authorized, isAdmin, validateSkill, upload.single("icon"), createSkill);

/**
 * @swagger
 * /skills/{id}:
 *   patch:
 *     tags:
 *       - Skills
 *     summary: Update skill
 *     security:
 *       - jwt: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The id of a specific a skill
 *         required: true
*     requestBody:
 *         content:
 *           multipart/form-data:
 *             schema:
 *               $ref: '#/components/schemas/UpdateSkill'
 *     responses:
 *       200:
 *         description: skill object
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/SkillResponse'
 *       400:
 *         description: Invalid mongoose id
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to update a skill
 *       404:
 *         description: skill not found
 *       500:
 *         description: Internal error
 */
skillRouter.patch("/:id", authorized, isAdmin, validateUpdateSkill, upload.single("icon"), updateSkill);

/**
 * @swagger
 * /skills/{id}:
 *   delete:
 *     tags:
 *       - Skills
 *     summary: Delete skill
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
 *                 default: Skill deleted
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Should be loggedin
 *       403:
 *         description: Should be an admin to delete a skill
 *       404:
 *         description: skill not found
 *       500:
 *         description: Internal error
 */
skillRouter.delete("/:id", authorized, isAdmin, deleteSkill);

export default skillRouter;
