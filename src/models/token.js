import mongoose from "mongoose";

const TokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      default: new mongoose.Types.ObjectId().toString(),
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
    type: {
      type: String,
      enum: ["otp", "jwt"],
      required: true,
    }
  },
  { versionKey: false }
);

const Token = mongoose.model("Token", TokenSchema);

export default Token;