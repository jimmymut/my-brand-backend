import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSkill:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           default: HTML
 *         summary:
 *           type: string
 *           default: Very good at html structuring.
 *         icon:
 *           type: string
 *           format: binary
 *       required:
 *         - name
 *         - icon
 *         - summary
 *     SkillResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         name:
 *           type: string
 *           default: HTML
 *         icon:
 *           type: string
 *           default: icon url
 *         summary:
 *           type: string
 *           default: Very good at html structuring.
 *         createdAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         updatedAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         __v:
 *           type: number
 *           default: 0
 *     UpdateSkill:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           default: HTML
 *         summary:
 *           type: string
 *           default: Very good at html structuring.
 *         icon:
 *           type: string
 *           format: binary
 */

const skillSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
