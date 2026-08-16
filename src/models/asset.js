import mongoose from "mongoose";

// A property/asset the user owns — land, a house, a vehicle, equipment, etc.
// Counts toward net worth at its current `value`. Type-specific attributes
// (size, UPI, plate…) are optional and shown per type in the UI.
const assetSchema = mongoose.Schema(
  {
    name: { type: String, default: "" },
    type: {
      type: String,
      enum: ["land", "house", "vehicle", "equipment", "investment", "other"],
      default: "other",
    },
    value: { type: Number, default: 0 }, // current estimated worth (fluctuates)
    cost: { type: Number, default: 0 }, // acquisition / buying cost
    acquiredDate: { type: String, default: "" },
    location: { type: String, default: "" },
    // land / house
    size: { type: Number, default: 0 },
    sizeUnit: { type: String, default: "sqm" },
    upi: { type: String, default: "" }, // land parcel id (UPI)
    // vehicle
    plate: { type: String, default: "" },
    year: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    color: { type: String, default: "#A78BFA" },
    order: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
    // wallet (account id) the purchase was paid from — deducts that wallet
    wallet: { type: String, default: "" },
    // disposal: when sold, proceeds credit `soldWallet` and it leaves net worth
    sold: { type: Boolean, default: false },
    soldWallet: { type: String, default: "" },
    soldAmount: { type: Number, default: 0 },
    soldDate: { type: String, default: "" },
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;
