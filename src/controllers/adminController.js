import User from "../models/user";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const getAllAdmins = async (req, res) => {
  await User.find({ title: "admin" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const adminSignUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    title: "admin",
  });
  const registered = await User.findOne({ email: admin.email });
  if (registered) {
    return res.status(400).json({ message: "This email is exists" });
  }
  await admin
    .save()
    .then((result) => {
      res.status(200).json({
        message: "account created successfully",
        email: result.email,
      });
    })
    .catch((error) => {
      return res.json(error);
    });
};

const deleteUserAccount = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  await User.findOneAndDelete({ id })
    .then((user) => {
      if (!user) {
        return res.status(404).json("User not found!");
      }
      res.status(200).json({ message: " account deleted!" });
    })
    .catch(() => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

export { adminSignUp, deleteUserAccount, getAllAdmins };
