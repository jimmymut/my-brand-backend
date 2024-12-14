import jwt from "jsonwebtoken";
import BlackList from "../models/blackList";

export default async function blackList(token, expAt = undefined) {
    try {
        let expiration = expAt;
        if (!expAt) {
          const decodedToken = jwt.decode(token);
          expiration = decodedToken.exp;
        }
        const exp = expiration * 1000;
        if (Date.now() < exp) {
          const blist = new BlackList({
            token,
            expAt: new Date(exp),
          });
          await blist.save();
        }
    } catch (error) {
        console.error(error);
    }
}
