import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    contName: {
      type: String,
      required: true,
    },
    contEmail: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
