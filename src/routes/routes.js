import express from "express";
import blogRouter from "./api/blogRouts";
import msgRouter from "./api/messageRoutes";
import adminRouter from "./api/adminRoutes";
import userRouter from "./api/userRoutes";
import loginout from "./api/logInOut";
import { notFound } from "../controllers/userController";

const router = express.Router();

router.use("/", loginout);
router.use("/blogs", blogRouter);
router.use("/messages", msgRouter);
router.use("/admins", adminRouter);
router.use("/users", userRouter);

router.all("*", notFound);

export default router;
