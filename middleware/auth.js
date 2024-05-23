import jwt from "jsonwebtoken";
import User from "../models/user.js";

function auth(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader === undefined) {
    return res.status(401).send({ message: "Not authorized" });
  }

  const [bearer, token] = authorizationHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        return res.status(401).send({ message: "Not authorized" });
      }

      const user = await User.findById(decode.id);

      if (user === null || user.token !== token) {
        return res.status(401).send({ message: "Invalid token" });
      }

      req.user = {
        id: decode.id,
        email: decode.email,
      };
      next();
    });
  } catch (error) {
    return res.status(401).send({ message: "Not authorized" });
  }
}

export default auth;
