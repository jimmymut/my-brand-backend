import Message from "../models/messagesModel.js";
import mongoose from "mongoose";

const getAllMessages = async (req, res) => {
  await Message.find()
    .then((messages) => {
      res.status(200).json(messages);
    })
    .catch(() => {
      res.status(500).json({ message: "error occured!" });
    });
};

const getNumberMessages = async (req, res) => {
  await Message.find()
    .then((numMessages) => {
      res.json({ messages: numMessages.length });
    })
    .catch(() => {
      res.status(500).json({ message: "error occured!" });
    });
};

const contactMe = async (req, res) => {
  const { contName, contEmail, phone, message } = req.body;
  const messages = new Message({
    contName,
    contEmail,
    phone,
    message,
  });
  await messages
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => {
      res.status(500).json({ Error: "send message failed" });
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
    const message = await Message.findOne({ _id: req.params.id });
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ Error: error });
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
    res.status(204).json("Message deleted");
  } catch {
    res.status(500).json("Error occured!");
  }
};

export {
  getAllMessages,
  contactMe,
  singleMessage,
  deleteMessage,
  getNumberMessages,
};
