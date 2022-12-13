import User from "../models/user";
import bcrypt from "bcrypt";
import encode from "../utils/encodeToken";

const userSignUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    title: "user",
  });
  const registered = await User.findOne({ email: user.email });
  if (registered) {
    return res.status(400).json({ message: "This email is already regisered" });
  }
  await user
    .save()
    .then(() => {
      res.status(200).json({ message: "account created successfully" });
    })
    .catch((error) => {
      return res.json(error);
    });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

const userLogin = async (req, res) => {
  try {
    const token = await encode(req.user._id);
    res.json({ LoggedIn: "Success", token });
  } catch (error) {
    return res.status(500).json("login Failed!");
  }
};

const userLogOut = (req, res) => {
  try {
    req.logout(() => {
      return res.status(200).json("logged Out!");
    });
  } catch (error) {
    return res.status(500).json("logout Failed!");
  }
};

const notFound = (req, res) => {
  res.status(404).json("404 Page Not Found");
};

export { userSignUp, getAllUsers, userLogin, userLogOut, notFound };
