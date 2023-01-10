import User from "../models/user.js";
import bcrypt from "bcrypt";
import encode from "../utils/encodeToken.js";

const userSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const registered = await User.findOne({ email: user.email });
    if (registered) {
      return res
        .status(400)
        .json({ message: "This email is already regisered" });
    }
    const newUser = await user.save();
    res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ title: "user" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getNumberNonAdminUsers = async (req, res) => {
  User.find({ title: "user" })
    .then((result) => {
      res.status(200).json({ numNotAdmin: result.length });
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const userLogin = async (req, res) => {
  try {
    const token = await encode(req.user._id);
    res.status(200).json({ LoggedIn: "Success", token });
  } catch (error) {
    return res.status(500).json("login Failed!");
  }
};

const userLogOut = (req, res) => {
  try {
    req.logout(() => {
      return res.status(200).json({ Message: "logged Out!" });
    });
  } catch (error) {
    return res.status(500).json("logout Failed!");
  }
};

const notFound = (req, res) => {
  res.status(404).json("404 Page Not Found");
};

export {
  userSignUp,
  getAllUsers,
  userLogin,
  userLogOut,
  notFound,
  getNumberNonAdminUsers,
};
