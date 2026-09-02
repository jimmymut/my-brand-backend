import mongoose from "mongoose";

// A movement of funds between two accounts/wallets. Not income or expense —
// it only relocates money, so net worth / spendable balance are unchanged.
const transferSchema = mongoose.Schema(
  {
    fromAccount: { type: String, default: "" }, // account id money leaves
    toAccount: { type: String, default: "" },   // account id money lands in
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

const Transfer = mongoose.model("Transfer", transferSchema);

export default Transfer;
