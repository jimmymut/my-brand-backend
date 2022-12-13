import Message from "../models/messagesModel";

const getAllMessages = async (req, res) => {
  await Message.find()
    .then((messages) => {
      res.json(messages);
    })
    .catch(() => {
      res.json({ message: "error occured!" });
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
      res.json(result);
    })
    .catch(() => {
      res.status(500).json({ Error: "send message failed" });
    });
};

const singleMessage = async (req, res) => {
  await Message.findOne({ _id: req.params.id })
    .then((message) => {
      res.json(message);
    })
    .catch(() => {
      res.status(404).json({ Error: "No message found!" });
    });
};

const deleteMessage = async (req, res) => {
  try {
    await Message.findOneAndDelete({ _id: req.params.id });
    res.status(204).json("Message deleted");
  } catch {
    res.status(404).json({ error: "message doesn't exist!" });
  }
};

export { getAllMessages, contactMe, singleMessage, deleteMessage };
