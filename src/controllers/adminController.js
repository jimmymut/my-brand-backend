import User from "../models/user.js";

export const getAllAdmins = async (req, res) => {
  User.find({ title: "admin" })
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ Message: "Error occured!" });
    });
};

export const getNumberAdmins = async (req, res) => {
  User.countDocuments({ title: "admin" })
    .then((result) => {
      return res.status(200).json({ Admins: result });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ Message: "Error occured!" });
    });
};

export const getAllAppUsers = async (req, res) => {
  User.find()
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Error occured!" });
    });
};

export const getNumberAllAppUsers = async (req, res) => {
  User.estimatedDocumentCount()
    .then((result) => {
      return res.status(200).json({ allUsers: result });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Error occured!" });
    });
};

export const checkIsAdmin = async (req, res) => {
  return res.status(200).json({message: "Is an admin"});
};

