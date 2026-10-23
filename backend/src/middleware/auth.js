import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.uid;
    if (!token)
      return res.status(401).json({ message: "Please sign in to continue" });
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-only-secret",
    );
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "user doesn't exists" });
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired or invalid. Please sign in again." });
  }
}
