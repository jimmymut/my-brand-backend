import User from "../models/user.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const getAllAdmins = async (req, res) => {
  User.find({ title: "admin" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const getNumberAdmins = async (req, res) => {
  User.find({ title: "admin" })
    .then((result) => {
      res.status(200).json({ Admins: result.length });
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const getAllAppUsers = async (req, res) => {
  User.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const getNumberAllAppUsers = async (req, res) => {
  User.find()
    .then((result) => {
      res.status(200).json({ allUsers: result.length });
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const checkIsAdmin = async (req, res) => {
  res.status(200).json("Is an admin");
};

const adminSignUp = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "User exist!" });
    }
    const createdAdmin = await admin.save();
    res.status(200).json(createdAdmin);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deleteUserAccount = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const exist = await User.findById(id);
  if (!exist) {
    return res.status(404).json({ error: "User not found!" });
  }
  await User.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json({ message: " account deleted!" });
    })
    .catch(() => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

export {
  adminSignUp,
  deleteUserAccount,
  getAllAdmins,
  getAllAppUsers,
  getNumberAdmins,
  getNumberAllAppUsers,
  checkIsAdmin,
};
