import mongoose from "mongoose";

const BlackListSchema = mongoose.Schema(
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

const BlackList = mongoose.model("BlackList", BlackListSchema);

export default BlackList;