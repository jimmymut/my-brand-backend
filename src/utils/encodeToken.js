import jwt from "jsonwebtoken";
import "dotenv/config";

const encode = async (user) => {
  const token = jwt.sign(user, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION_TIME??"2h",
  });
  return token;
};

export default encode;
