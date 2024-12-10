import passport from "passport";
import User from "../models/user";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import "dotenv/config";

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
        await User.updateOne({_id: user._id}, {$set: { isLoggedIn: true }});
        const { password: psw, isLoggedIn, ...rest } = user._doc;
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
      secretOrKey: process.env.SECRET_KEY,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload._id);

        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (!user.isLoggedIn) {
          return done(null, false, { message: "Please login first!" });
        }
        const { password: psw, isLoggedIn, ...rest } = user._doc;
        return done(null, rest);
      } catch (error) {
        console.log(error);
        return done({ message: "Server Error!" }, false);
      }
    }
  )
);
