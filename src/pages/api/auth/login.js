// Last edited by you@example.com @ 15/09/26 10:58.
// src/pages/api/auth/login.js
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // ← Email verified hai ya nahi check karo
  if (!user.isVerified) {
    return res.status(403).json({
      error:
        "Your email is not verified. Please check your inbox and verify your email before logging in.",
      notVerified: true, // frontend pe resend option dikhane ke liye
      email: user.email,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.status(200).json({
    message: "Login successful!",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      geolocation: user.geolocation,
    },
  });
}
