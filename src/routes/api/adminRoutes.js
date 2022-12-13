import express from "express";
import {
  adminSignUp,
  deleteUserAccount,
  getAllAdmins,
} from "../../controllers/adminController";
import { validatedUserSignUp } from "../../middlewares/userSchemaValidate";
import { authorized } from "../../middlewares/authenticate";
import { isAdmin } from "../../middlewares/isAdmin";

const adminRouter = express.Router();

adminRouter.post("/", validatedUserSignUp, adminSignUp);
adminRouter.get("/", authorized, isAdmin, getAllAdmins);
adminRouter.delete("/:id", authorized, isAdmin, deleteUserAccount);

export default adminRouter;
