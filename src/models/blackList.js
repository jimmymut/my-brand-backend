import mongoose from "mongoose";

const TokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    expAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { versionKey: false }
);

const Token = mongoose.model("Token", TokenSchema);

export default Token;