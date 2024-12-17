import express from "express";
import blogRouter from "./api/blogRouts.js";
import msgRouter from "./api/messageRoutes.js";
import adminRouter from "./api/adminRoutes.js";
import userRouter from "./api/userRoutes.js";
import loginout from "./api/aauth.js";
import { notFound } from "../controllers/userController.js";
import swaggerUi from "swagger-ui-express";
import specs from "../utils/swaggerConfig.js";
import { authorized } from "../middlewares/authenticate.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import workRouter from "./api/workRoutes.js";
import skillRouter from "./api/skillsRoutes.js";

const router = express.Router();

router.use("/", loginout);
router.use("/blogs", blogRouter);
router.use("/messages", msgRouter);
router.use("/admins", authorized, isAdmin, adminRouter);
router.use("/users", userRouter);
router.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
router.use("/works", workRouter);
router.use("/skills", skillRouter);

router.all("*", notFound);

export default router;
