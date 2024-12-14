import jwt from "jsonwebtoken";
import { jwt_expiry_time, jwt_secret_key, jwt_verify_secret_key } from "../config";

const encode = (user, expiresIn = null, verify = false) => {
  const secret_key = verify? jwt_verify_secret_key: jwt_secret_key;
  const token = jwt.sign(user, secret_key, {
    expiresIn: expiresIn??jwt_expiry_time??"2h",
  });
  return token;
};

export default encode;
