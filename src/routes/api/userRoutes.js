import express from "express";
import { userSignUp, getAllUsers } from "../../controllers/userController";
import { authorized } from "../../middlewares/authenticate";
import { isAdmin } from "../../middlewares/isAdmin";
import { validatedUserSignUp } from "../../middlewares/userSchemaValidate";

const userRouter = express.Router();

userRouter.get("/", authorized, isAdmin, getAllUsers);

userRouter.post("/", validatedUserSignUp, userSignUp);

export default userRouter;
