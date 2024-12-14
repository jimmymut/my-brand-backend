import User from "../models/user.js";
import bcrypt from "bcrypt";
import encode from "../utils/encodeToken.js";
import mongoose from "mongoose";
import {
  oAuth2Client,
  google_client_id,
  base_url,
  frontend_base_url,
} from "../config";
import { emailService } from "../utils/EmailService.js";
import Token from "../models/token.js";
import moment from "moment";
import jwt from "jsonwebtoken";

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
      const baseUrl = base_url ?? `${req.protocol}://${req.get("host")}`;
      const verifyToken = new Token({
        userId: newUser._id,
        expiresAt: moment().add(30, "m").toDate(),
      });
      const token = await verifyToken.save();
      const tkn = encode({ _id: token._id }, "30m", true);
      const resendEmailToken = encode({ _id: newUser._id });
      const { password: psw, ...rest } = newUser._doc;
      console.log(tkn);
      //! To do, implement the queuing mechanism to handle sending emails in background
      //! also design an email templete
      emailService(
        email,
        `Verify Email`,
        `<p>Hi ${firstName},</p><br/><br/><p>Thank you for registering to our platform.</p><p>please click to the <a style="color:blue; text-decoration:underline" href="${baseUrl}/users/verify-email?tkn=${tkn}">this link</a> in order to verify your email and be able to access the features, if the email is not verified, your account will be deleted after 30 days.</p><p>The link will expire in 30 minutes, if the link expires, you can request to <a style="color:blue; text-decoration:underline" href="${frontend_base_url}?exp_email=true">another link</a> if 30 days are not yet passed from the signup time, otherwise you'll be required to register again!</p><br/><br/><p>Best regards,</p><p>Jimmy's website</p>`
      );
      return res.status(200).json({ token: resendEmailToken, user: rest });
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
        return res.status(400).json({
          message: "Invalid id",
        });
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
      const { password, deleteAt, ...rest } = req.user._doc;
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
        // I have to count for the wrong password attempts to a max of 3,
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
      const token = encode({ _id: req.user._id });
      return res
        .status(200)
        .json({ LoggedIn: "Success", token, user: req.user });
    } catch (error) {
      return res.status(500).json({ message: `Login Failed! ${error}` });
    }
  };

  static userLogOut = async (req, res) => {
    try {
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
        if (!registered.verifiedAt) {
          registered.verifiedAt = new Date();
          registered.deleteAt = null;
        }
        await registered.save();
        const token = encode(registered._id);
        const { password: psw, ...rest } = registered._doc;
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
        verifiedAt: new Date(),
        deleteAt: null,
      });
      const newUser = await user.save();
      const token = encode(newUser._id);
      const { password: psw, ...rest } = newUser._doc;
      return res
        .status(200)
        .json({ message: "Login success", user: rest, token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  static verifyEmail = async (req, res) => {
    try {
      const { verifyToken } = req;
      const user = await User.findById(verifyToken.userId);
      if (!user)
        return res.redirect(
          `${frontend_base_url}?verify_error=Account not found, If this was your email, the account might have been deleted, so please sign up again!`
        );
      if (user.verifiedAt)
        return res.redirect(
          `${frontend_base_url}?verify_error=Email already verified!`
        );
      user.verifiedAt = new Date();
      user.deleteAt = null;
      await user.save();
      return res.redirect(
        `${frontend_base_url}?verify_success=Email verified successfully!`
      );
    } catch (error) {
      return res.redirect(
        `${frontend_base_url}?verify_error=${error?.message ?? error}`
      );
    }
  };

  static resendVerificationEmail = async (req, res) => {
    try {
      if (req.user.verifiedAt)
        return res.status(400).json({ message: "Email already verified!" });
      const baseUrl = base_url ?? `${req.protocol}://${req.get("host")}`;
      const verifyToken = new Token({
        userId: req.user._id,
        expiresAt: moment().add(30, "m").toDate(),
      });
      const token = await verifyToken.save();
      const tkn = encode({ _id: token._id }, "30m", true);
      console.log("Resend token", tkn);
      await emailService(
        req.user.email,
        `Verify Email`,
        `<p>Hi ${req.user.firstName},</p><br/><br/><p>Thank you for registering to our platform.</p><p>please click to the <a style="color:blue; text-decoration:underline" href="${baseUrl}/users/verify-email?tkn=${tkn}">this link</a> in order to verify your email and be able to access the features, if the email is not verified, your account will be deleted after 30 days.</p><p>The link will expire in 30 minutes, if the link expires, you can request to <a style="color:blue; text-decoration:underline" href="${frontend_base_url}?exp_email=true">another link</a> if 30 days are not yet passed from the signup time, otherwise you'll be required to register again!</p><br/><br/><p>Best regards,</p><p>Jimmy's website</p>`
      );
      return res.status(200).json({
        message: "Verification email is sent, please check your emails",
      });
    } catch (error) {
      return res.status(500).json({ error: error?.message ?? error });
    }
  };
}

export const notFound = (req, res) => {
  return res.status(404).json({ error: `${req.originalUrl} is not found!` });
};
