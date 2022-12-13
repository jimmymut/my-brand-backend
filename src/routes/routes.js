import express from "express";
import blogRouter from "./api/blogRouts";
import msgRouter from "./api/messageRoutes";
import adminRouter from "./api/adminRoutes";

const router = express.Router();

router.use("/blogs", blogRouter);
router.use("/messages", msgRouter);
router.use("/admin", adminRouter);

export default router;
