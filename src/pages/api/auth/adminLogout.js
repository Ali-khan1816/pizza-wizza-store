// Last edited by you@example.com @ 22/09/26 10:44.
// src/pages/api/auth/adminLogout.js

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed.",
    });
  }

  res.setHeader(
    "Set-Cookie",
    "adminToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
  );

  return res.status(200).json({
    message: "Admin logged out successfully.",
  });
}
