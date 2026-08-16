import mongoose from "mongoose";

// A money location / wallet the user holds funds in — mobile money, a bank,
// cash, or a savings pot. Records (income/expense/savings) reference an account
// by NAME, and per-account balances are derived from those flows on the client.
const accountSchema = mongoose.Schema(
  {
    name: { type: String, default: "" },
    // "spendable" = everyday wallet (Airtel, MTN, BK current, Cash);
    // "savings"   = a pot money is set aside in (Ejo Heza, a savings account).
    type: {
      type: String,
      enum: ["spendable", "savings"],
      default: "spendable",
    },
    color: { type: String, default: "#38BDF8" },
    // balance the account already held before you started tracking here
    openingBalance: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
