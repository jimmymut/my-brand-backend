import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     MessageSend:
 *       type: object
 *       properties:
 *         contName:
 *           type: string
 *           default: Jimmy Mutabazi
 *         contEmail:
 *           type: string
 *           default: mutabazijimmy9@gmail.com
 *         phone:
 *           type: string
 *           default: "+250789706729"
 *         message:
 *           type: string
 *           default: Good work, reach out to me and have a talk.
 *       required:
 *         - contName
 *         - contEmail
 *         - phone
 *         - message
 *     MessageResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         name:
 *           type: string
 *           default: Jimmy Mutabazi
 *         email:
 *           type: string
 *           default: mutabazijimmy9@gmail.com
 *         phone:
 *           type: string
 *           default: "+250789706729"
 *         message:
 *           type: string
 *           default: Good work, reach out to me and have a talk.
 *         createdAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         updatedAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         __v:
 *           type: number
 *           default: 0
 */
const messageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
