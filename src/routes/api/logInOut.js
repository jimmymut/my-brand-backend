import express from "express";
import { validatedUserLogin } from "../../middlewares/userSchemaValidate";
import { authorized } from "../../middlewares/authenticate";
import { userLogin, userLogOut } from "../../controllers/userController";
import { authUserLogin } from "../../middlewares/authenticate";

const loginout = express.Router();

loginout.post("/login", validatedUserLogin, authUserLogin, userLogin);
loginout.post("/logout", authorized, userLogOut);

export default loginout;
