import express from "express";
import {
  adminSignUp,
  deleteAdminAccount,
  getAllAdmins,
  adminLogin,
} from "../../controllers/adminController";
import {
  validatedAdminSignUp,
  validatedAdminLogin,
} from "../../middlewares/adminSchemaValidate";
import passport from "passport";

const adminRouter = express.Router();

adminRouter.post("/login", validatedAdminLogin, adminLogin);
adminRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAllAdmins
);
adminRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  validatedAdminSignUp,
  adminSignUp
);
// adminRouter.patch("/:id");
adminRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteAdminAccount
);

export default adminRouter;
