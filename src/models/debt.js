import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" },
    // wallet (account id) the payment moved through — links it to a balance
    account: { type: String, default: "" },
  },
  { _id: true }
);

const debtSchema = mongoose.Schema(
  {
    direction: { type: String, enum: ["borrowed", "lent"], default: "borrowed" },
    name: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" },
    due: { type: String, default: "" },
    desc: { type: String, default: "" },
    // wallet (account id) the borrowed money landed in / the lent money left from.
    // Empty = a pre-existing debt kept unlinked from account balances.
    account: { type: String, default: "" },
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

const Debt = mongoose.model("Debt", debtSchema);

export default Debt;
