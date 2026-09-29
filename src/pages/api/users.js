// Last edited by you@example.com @ 15/09/26 11:16.
// src/pages/api/users.js
import User from "@/models/User";
import db from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  // Password field exclude karo — security
  const users = await User.find({})
    .select(
      "-password -resetToken -resetTokenExpiry -verifyToken -verifyTokenExpiry",
    )
    .sort({ createdAt: -1 });

  return res.status(200).json({ users });
}
