import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
const sign = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || "development-only-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
function setSession(res, user) {
  const token = sign(user);
  res.cookie("bookleaf_session", token, cookieOptions());
  return token;
}

router.post("/register", async (req, res, next) => {
  try {
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(80),
        email: z.string().trim().email(),
        role: z.enum(["author", "admin"]).optional(),
      })
      .safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "Please check the form fields",
        details: parsed.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`,
        ),
      });
    const { name, email, role } = parsed.data;
    if (await User.exists({ email: email.toLowerCase() }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    const wantedRole =
      role === "admin" && process.env.ALLOW_ADMIN_REGISTRATION === "true"
        ? "admin"
        : "author";
    const user = await User.create({ name, email, role: wantedRole });
    setSession(res, user);
    res.status(201).json({
      user: safeUser(user),
      notice:
        "Password authentication is not enabled in this sample. It can be added using bcrypt password hashing.",
    });
  } catch (e) {
    next(e);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const parsed = z
      .object({ email: z.string().trim().email() })
      .safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: "A valid email address is required" });
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user)
      return res.status(404).json({
        message: "No account found for this email. Register the account first.",
      });
    setSession(res, user);
    res.json({
      user: safeUser(user),
      notice:
        "Password authentication is not enabled in this sample. It can be implemented with bcrypt password hashing.",
    });
  } catch (e) {
    next(e);
  }
});
router.post("/logout", requireAuth, (_req, res) => {
  res.clearCookie("bookleaf_session", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/",
  });
  res.json({ message: "Signed out" });
});
router.get("/me", requireAuth, (req, res) =>
  res.json({ user: safeUser(req.user) }),
);
export default router;
