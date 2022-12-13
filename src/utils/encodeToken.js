import jwt from "jsonwebtoken";
import "dotenv/config";
const encode = async (id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "2h",
  });
  return token;
};

export default encode;
