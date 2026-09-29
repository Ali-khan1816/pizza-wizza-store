// Last edited by you@example.com @ 23/09/26 09:44.
// src/pages/api/auth/adminLogin.js

import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed.",
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
      console.error("Admin authentication environment variables are missing.");

      return res.status(500).json({
        error: "Admin authentication is not configured.",
      });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        error: "Invalid admin credentials.",
      });
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.setHeader(
      "Set-Cookie",
      [
        `adminToken=${encodeURIComponent(token)}`,
        "HttpOnly",
        "Path=/",
        "Max-Age=86400",
        "SameSite=Lax",
        isProduction ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; "),
    );

    return res.status(200).json({
      message: "Admin login successful!",
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
}
