import express from "express";
import passport from "passport";
import {
  getAllMessages,
  contactMe,
  singleMessage,
  deleteMessage,
} from "../../controllers/messagesController";
import validatedMessage from "../../middlewares/messageSchemaValidator";

const msgRouter = express.Router();

msgRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAllMessages
);

msgRouter.post("/", validatedMessage, contactMe);
msgRouter.get("/:id", passport.authenticate("jwt", { session: false }), singleMessage);
msgRouter.delete("/:id", passport.authenticate("jwt", { session: false }), deleteMessage);

export default msgRouter;
