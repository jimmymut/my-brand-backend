import User from "../models/user.js";

const isNotAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.user._id, title: "admin" });
    if (admin) {
      return res.status(401).send("Admins are not allowed to like an article");
    }
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};
const isAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.user._id, title: "admin" });
    if (!admin) {
      return res.status(401).send("Admins only are allowed");
    }
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};

export { isAdmin, isNotAdmin };
