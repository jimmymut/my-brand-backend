import User from "../models/user.js";

const isNotAdmin = async (req, res, next) => {
  try {
    if (req.user.title === "admin") {
      return res
        .status(403)
        .json({ message: "Admins are not allowed to like an article" });
    }
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};
const isAdmin = async (req, res, next) => {
  try {
    if ((req.user.title !== "admin")) {
      return res.status(403).json({ message: "Admins only are allowed" });
    }
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};

export { isAdmin, isNotAdmin };
