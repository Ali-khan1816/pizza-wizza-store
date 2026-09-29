// src/pages/api/auth/resetPassword.js
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { email, token, password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const user = await User.findOne({
    email,
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({
        error: "Invalid or expired reset link. Please request a new one.",
      });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json({ message: "Password reset successfully! Please log in." });
}
