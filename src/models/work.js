import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWork:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           default: Andela Technical Leadership program
 *         body:
 *           type: string
 *           default: This is an extensive training program
 *       required:
 *         - title
 *         - body
 *     WorkResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         title:
 *           type: string
 *           default: Andela Technical Leadership program
 *         body:
 *           type: string
 *           default: This is an extensive training program
 *         createdAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         updatedAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         __v:
 *           type: number
 *           default: 0
 *     UpdateWork:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           default: Andela Technical Leadership program
 *         body:
 *           type: string
 *           default: This is an extensive training program
 */

const workSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Work = mongoose.model("Work", workSchema);

export default Work;
