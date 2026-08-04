import mongoose from "mongoose";

const contributionSchema = mongoose.Schema(
  {
    month: {
      type: String,
    },
    bucket: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
    },
    // Where the money is held/allocated (e.g. "Ejo Heza", "BK").
    account: {
      type: String,
      default: "",
    },
    // "deposit" adds to a goal; "withdrawal" records money taken back out (used).
    kind: {
      type: String,
      enum: ["deposit", "withdrawal"],
      default: "deposit",
    },
  },
  { timestamps: true }
);

const Contribution = mongoose.model("Contribution", contributionSchema);

export default Contribution;
