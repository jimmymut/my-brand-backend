import mongoose from "mongoose";

// A single "target changed to X from this month on" breakpoint.
const targetChangeSchema = mongoose.Schema(
  { month: { type: String, default: "" }, target: { type: Number, default: 0 } },
  { _id: false }
);

// A custom savings goal (the built-in goals live in the frontend constants).
const goalSchema = mongoose.Schema(
  {
    name: { type: String, default: "" },
    short: { type: String, default: "" },
    sub: { type: String, default: "" },
    target: { type: Number, default: 0 },
    color: { type: String, default: "#34D399" },
    account: { type: String, default: "" },
    // "monthly" = recurring monthly target; "target" = one lump sum by a deadline
    type: { type: String, enum: ["monthly", "target"], default: "monthly" },
    // the month this goal begins counting toward savings/debt ("YYYY-MM")
    startMonth: { type: String, default: "" },
    // monthly goals: last month they count ("" = open-ended, run indefinitely)
    endMonth: { type: String, default: "" },
    // target goals: the date the lump sum should be reached by ("YYYY-MM-DD")
    deadline: { type: String, default: "" },
    order: { type: Number, default: 0 },
    // monthly-target changes over time: each entry sets the target from `month`
    // onward. The effective target for a month is the latest entry <= that month
    // (falling back to `target`). Lets a goal's target rise/fall for future
    // months while past months keep the amount they were actually owed.
    targetSchedule: { type: [targetChangeSchema], default: [] },
    // when set, this doc is not a standalone goal but a carrier for target
    // overrides of a BUILT-IN goal (value = the built-in bucket id, e.g. "ejoheza").
    overrideFor: { type: String, default: "" },
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
