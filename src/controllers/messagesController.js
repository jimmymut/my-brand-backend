import Message from "../models/messagesModel.js";
import mongoose from "mongoose";
import { emailService } from "../utils/EmailService.js";
import { own_email } from "../config";

const getAllMessages = async (req, res) => {
  await Message.find()
    .then((messages) => {
      return res.status(200).json(messages);
    })
    .catch(() => {
      return res.status(500).json({ message: "error occured!" });
    });
};

const getNumberMessages = async (req, res) => {
  await Message.find()
    .then((numMessages) => {
      res.json({ messages: numMessages.length });
    })
    .catch(() => {
      return res.status(500).json({ message: "error occured!" });
    });
};

const contactMe = async (req, res) => {
  const { contName, contEmail, phone, message } = req.body;
  const messages = new Message({
    name: contName,
    email: contEmail,
    phone,
    message,
  });
  await messages
    .save()
    .then(async (result) => {
      await emailService(
        own_email,
        `${result.name} sent you a message`,
        `<p>Name: ${result.name}<br/>Email: ${result.email}<br/>Phone Number: ${result.phone}<br/>Message: ${result.message}</p>`
      );
      return res.status(200).json(result);
    })
    .catch(() => {
      return res.status(500).json({ Error: "send message failed" });
    });
};

const singleMessage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid id");
    }
    const exist = await Message.findById(req.params.id);
    if (!exist) {
      return res.status(404).json({ error: "Message not found!" });
    }
    return res.status(200).json({ message: exist });
  } catch (error) {
    return res.status(500).json({ Error: `Error occurred ${error}` });
  }
};

const deleteMessage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid id");
    }
    const exist = await Message.findById(req.params.id);
    if (!exist) {
      return res.status(404).json({ error: "Message not found!" });
    }
    await Message.findOneAndDelete({ _id: req.params.id });
    return res.status(204).json("Message deleted");
  } catch {
    return res.status(500).json("Error occured!");
  }
};

export {
  getAllMessages,
  contactMe,
  singleMessage,
  deleteMessage,
  getNumberMessages,
};
