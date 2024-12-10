import passport from "passport";
import "../authentications/auth.js";

const auth = (stratege, req, res, next) => {
    return passport.authenticate(stratege, { session: false }, function(err, user, info) {
        if (err) return res.status(500).json(err);
        if (!user) {
          if (info) return res.status(401).json({message: info.message});
          return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        return next();
    })(req, res, next);
}

const authorized = (req, res, next) => auth("jwt", req, res, next);

const authUserLogin = (req, res, next) => auth("local", req, res, next);

export { authorized, authUserLogin };
