import express from "express";
import {
  getAllMessages,
  contactMe,
  singleMessage,
  deleteMessage,
} from "../../controllers/messagesController";
import validatedMessage from "../../middlewares/messageSchemaValidator";
import { authorized } from "../../middlewares/authenticate";
import { isAdmin } from "../../middlewares/isAdmin";

const msgRouter = express.Router();

msgRouter.get("/", authorized, isAdmin, getAllMessages);

msgRouter.post("/", validatedMessage, contactMe);
msgRouter.get("/:id", authorized, isAdmin, singleMessage);
msgRouter.delete("/:id", authorized, isAdmin, deleteMessage);

export default msgRouter;
