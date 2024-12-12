import User from "../models/user.js";
import bcrypt from "bcrypt";
import encode from "../utils/encodeToken.js";
import mongoose from "mongoose";
import { oAuth2Client, google_client_id } from "../config";
import { ExtractJwt } from "passport-jwt";

export class UserController {
  static async userSignUp(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const registered = await User.findOne({ email });
      if (registered) {
        return res
          .status(400)
          .json({ message: "This email is already regisered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      const newUser = await user.save();
      return res.status(200).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: `Error occured! ${error}` });
    }
  }

  static getAllUsers = async (req, res) => {
    try {
      const users = await User.find({ title: "user" });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: `Error occured! ${error}` });
    }
  };

  static getSingleUser = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send("Invalid id");
      }

      const user = await User.findOne({ _id: req.params.id });
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: `Error occured! ${error}` });
    }
  };

  static userProfile = async (req, res) => {
    try {
      const { password, isLoggedIn, ...rest } = req.user;
      return res.status(200).json(rest);
    } catch (error) {
      return res.status(500).json({ error: `Error occured! ${error}` });
    }
  };

  static getNumberNonAdminUsers = async (req, res) => {
    User.countDocuments({ title: "user" })
      .then((result) => {
        return res.status(200).json({ numNotAdmin: result });
      })
      .catch((err) => {
        return res.status(500).json({ Message: `Error occured! ${err}` });
      });
  };

  static isUser = async (req, res) => {
    return res.status(200).json("Is a user");
  };

  static changePassword = async (req, res) => {
    try {
      const { old, newPwd } = req.body;
      const { _id, password } = req.user;
      if (!bcrypt.compareSync(old, password)) {
        //! To do
        // I have to count for the wrongo password attempts to a max of 3,
        // then I lock this account for a certain period! to increase the security.
        return res.status(401).json({ message: "Incorrect password" });
      }

      if (bcrypt.compareSync(newPwd, password)) {
        return res.status(403).json({
          message: "New password should be the same as current password",
        });
      }
      const newPassword = bcrypt.hashSync(newPwd, 10);
      await User.updateOne({ _id }, { $set: { password: newPassword } });
      return res
        .status(200)
        .json({ message: "Password changed successfully!" });
    } catch (error) {
      return res.status(500).json({ message: `Error occurred! ${error}` });
    }
  };

  static userLogin = async (req, res) => {
    try {
      const token = await encode({ _id: req.user._id });
      return res
        .status(200)
        .json({ LoggedIn: "Success", token, user: req.user });
    } catch (error) {
      return res.status(500).json({ message: `Login Failed! ${error}` });
    }
  };

  static userLogOut = async (req, res) => {
    try {
      await User.updateOne(
        { _id: req.user._id },
        { $set: { isLoggedIn: false } }
      );
      return res.status(200).json({ message: "logged Out!" });
    } catch (error) {
      return res.status(500).json({ error: `logout Failed! ${error}` });
    }
  };

  static googleAuth = async (req, res) => {
    try {
      const { tokens } = await oAuth2Client.getToken(req.body.code);
      const { payload } = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: google_client_id,
      });

      const { sub, email, picture, given_name, family_name } = payload;
      const registered = await User.findOne({ email });
      if (registered) {
        if (!registered.googleId) {
          registered.googleId = sub;
        }
        if (!registered.proPic) {
          registered.proPic = picture;
        }
        await registered.save();
        const token = await encode(registered._id);
        const { password: psw, isLoggedIn, ...rest } = registered._doc;
        return res
          .status(200)
          .json({ message: "Login success", user: rest, token });
      }
      const user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId: sub,
        proPic: picture,
      });
      const newUser = await user.save();
      const token = await encode(newUser._id);
      const { password: psw, isLoggedIn, ...rest } = newUser._doc;
      return res
        .status(200)
        .json({ message: "Login success", user: rest, token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

export const notFound = (req, res) => {
  return res.status(404).json({ error: `${req.originalUrl} is not found!` });
};
