import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" },
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
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

const Debt = mongoose.model("Debt", debtSchema);

export default Debt;
