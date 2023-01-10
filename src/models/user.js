import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSignUp:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           default: Jimmy
 *         lastName:
 *           type: string
 *           default: Mutabazi
 *         email:
 *           type: string
 *           default: mutabazijimmy9@gmail.com
 *         password:
 *           type: string
 *           default: password
 *         comfirmPassword:
 *           type: string
 *           default: password
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - comfirmPassword
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         firstName:
 *           type: string
 *           default: Jimmy
 *         lastName:
 *           type: string
 *           default: Mutabazi
 *         email:
 *           type: string
 *           default: mutabazijimmy9@gmail.com
 *         password:
 *           type: string
 *           default: $2b$10$WyFYt1nWRDaUVwsQcLO61yTZECn4bJpEpbiqgsMT1lzTzZAfpq
 *         title:
 *           type: string
 *           default: user
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

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
