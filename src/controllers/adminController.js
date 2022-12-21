import Admin from "../models/adminModel";
import bcrypt from "bcrypt";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../authentications/auth";

const getAllAdmins = async (req, res) => {
  await Admin.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error!" });
    });
};

const adminSignUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  const registered = await Admin.findOne({ email: admin.email });
  if (registered) {
    return res.status(400).json({ message: "This email is already regisered" });
  }
  await admin
    .save()
    .then((result) => {
      res.status(200).json({
        message: "account created successfully",
        admin: {
          email: result.email,
          id: result._id,
        },
      });
    })
    .catch((error) => {
      return res.json(error);
    });
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found!" });
    }
    const validAdmin = await bcrypt.compare(password, admin.password);
    if (!validAdmin) {
      return res.status(400).json({ message: "Wrong Password or email" });
    }
    const token = jwt.sign(
      {
        email: admin.email,
        id: admin._id,
        name: admin.firstName + " " + admin.lastName,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    return res
      .status(200)
      .json({ message: "Logged in Successfully", token: "Bearer " + token });
  } catch (error) {
    res.status(400).json(error);
  }
};
const deleteAdminAccount = async (req, res) => {
  await Admin.findByIdAndDelete({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: " account deleted!" });
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error!" });
    });
};

export { adminSignUp, deleteAdminAccount, getAllAdmins, adminLogin };
