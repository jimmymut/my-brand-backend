import passport from "passport";
import User from "../models/user";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { jwt_secret_key, jwt_verify_secret_key } from "../config";
import Token from "../models/token";

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
        const { password: psw, ...rest } = user._doc;
        return done(null, rest);
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
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload._id);

        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, user);
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
    },
    async (jwtPayload, done) => {
      try {
        const token = await Token.findById(jwtPayload._id);
        if (!token) {
          return done(null, false, { message: "Verification link not found or has expired" });
        }
        return done(null, token);
      } catch (error) {
        console.log(error);
        return done(null, false, { message: "Server Error!" });
      }
    }
  )
);
