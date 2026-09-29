// Last edited by you@example.com @ 15/09/26 10:57.
// src/pages/api/auth/verifyEmail.js
import User from "@/models/User";
import db from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).json({ error: "Invalid verification link." });
  }

  const user = await User.findOne({
    email,
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      error: "Invalid or expired verification link. Please sign up again.",
    });
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json({ message: "Email verified successfully! You can now log in." });
}
