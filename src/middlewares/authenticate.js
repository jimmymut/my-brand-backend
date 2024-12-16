import passport from "passport";
import "../authentications/auth.js";
import { frontend_base_url } from "../config";

const auth = (stratege, req, res, next) => {
  return passport.authenticate(
    stratege,
    { session: false },
    function (err, user, info) {
      if (err) return res.status(500).json(err);
      if (!user) {
        if (info) return res.status(401).json({ message: info.message });
        return res.status(401).json({ message: "Unauthorized" });
      }
      if(user.user){
        req.user = user.user;
        req.otherInfo = user.payload;
      }else{
        req.user = user;
      }
      return next();
    }
  )(req, res, next);
};

export const authorized = (req, res, next) => auth("jwt", req, res, next);

export const authUserLogin = (req, res, next) => auth("local", req, res, next);

export const authorizeVerifyEmail = (req, res, next) => {
  return passport.authenticate(
    "verify-email-jwt",
    { session: false },
    function (err, user, info) {
      if (err)
        return res.redirect(`${frontend_base_url}?verify_error=${err.message}`);
      if (!user) {
        if (info)
          return res.redirect(
        `${frontend_base_url}?verify_error=${info.message}`
      );
      return res.redirect(`${frontend_base_url}?verify_error=Unauthorized`);
    }
    req.verifyToken = user.token;
    req.otherInfo = user.payload;
    return next();
  }
)(req, res, next);
};

export const authorizeOtp = (req, res, next) => auth("otp-jwt", req, res, next);
