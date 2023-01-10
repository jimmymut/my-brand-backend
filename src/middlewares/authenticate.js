import passport from "passport";
import "../authentications/auth.js";

const authorized = passport.authenticate("jwt", { session: false });

const authUserLogin = passport.authenticate("local", { session: false });

export { authorized, authUserLogin };
