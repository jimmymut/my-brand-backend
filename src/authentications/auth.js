import passport from "passport";
import User from "../models/user";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { jwt_secret_key, jwt_verify_secret_key } from "../config";
import Token from "../models/token";
import BlackList from "../models/blackList";
import jwt from "jsonwebtoken";
import encode from "../utils/encodeToken";
import blackList from "../utils/blacklist";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password or email" });
        }
        if (user.currentToken) {
          blackList(user.currentToken);
        }
        const token = encode({ _id: user._id });
        user.currentToken = token;
        user.save();
        const { password: psw, currentToken, ...rest } = user._doc;
        return done(null, { payload: { token }, user: rest });
      } catch (error) {
        console.log(error);
        return done(null, false, { message: "Server Error!" });
      }
    }
  )
);
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt_secret_key,
      passReqToCallback: true,
    },
    async (req, jwtPayload, done) => {
      try {
        const getToken = ExtractJwt.fromAuthHeaderAsBearerToken();
        const token = getToken(req);
        const blacklist = await BlackList.findOne({ token });
        if (blacklist) return done(null, false, { message: "Please login!" });

        const user = await User.findById(jwtPayload._id);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, { user, payload: { token, exp: jwtPayload.exp } });
      } catch (error) {
        console.log(error);
        return done({ message: "Server Error!" }, false);
      }
    }
  )
);

passport.use(
  "verify-email-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter("tkn"),
      secretOrKey: jwt_verify_secret_key,
      passReqToCallback: true,
    },
    async (req, jwtPayload, done) => {
      try {
        const getToken = ExtractJwt.fromUrlQueryParameter("tkn");
        const jwtToken = getToken(req);
        const blacklist = await BlackList.findOne({ token: jwtToken });
        if (blacklist) return done(null, false, { message: "Link expired!" });
        const token = await Token.findById(jwtPayload._id);
        if (!token) {
          return done(null, false, {
            message: "Verification link not found or has expired",
          });
        }
        return done(null, {
          token,
          payload: { token: jwtToken, exp: jwtPayload.exp },
        });
      } catch (error) {
        console.log(error);
        return done(null, false, { message: "Server Error!" });
      }
    }
  )
);
