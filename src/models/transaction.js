import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    date: {
      type: String,
    },
    kind: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: null,
    },
    desc: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
