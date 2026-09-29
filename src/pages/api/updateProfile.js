// Last edited by you@example.com @ 15/09/26 11:16.
// src/pages/api/updateProfile.js
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  // Token verify karo
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  const { name, geolocation, currentPassword, newPassword } = req.body;

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Name aur address update karo
  if (name) user.name = name;
  if (geolocation) user.geolocation = geolocation;

  // Password change — optional
  if (newPassword) {
    if (!currentPassword) {
      return res
        .status(400)
        .json({ error: "Current password is required to set a new one." });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully!",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      geolocation: user.geolocation,
    },
  });
}
