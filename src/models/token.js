import mongoose from "mongoose";

const TokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      default: String(Date.now()),
      required: true,
      unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { versionKey: false }
);

const Token = mongoose.model("Token", TokenSchema);

export default Token;