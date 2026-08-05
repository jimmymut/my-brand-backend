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
