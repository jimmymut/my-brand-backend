import mongoose from "mongoose";

const budgetItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    // which month this plan item belongs to ("YYYY-MM"). Empty = legacy items,
    // treated as the current month by the frontend.
    month: {
      type: String,
      default: "",
    },
    // manual display position (drag-to-reorder); lower = higher in the list
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const BudgetItem = mongoose.model("BudgetItem", budgetItemSchema);

export default BudgetItem;
