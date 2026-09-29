// Last edited by you@example.com @ 15/09/26 10:56.
// src/pages/api/auth/resendVerification.js
import User from "@/models/User";
import db from "@/utils/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      message: "If this email exists, a verification link has been sent.",
    });
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ error: "This email is already verified. Please log in." });
  }

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = Date.now() + 1000 * 60 * 60 * 24;

  user.verifyToken = verifyToken;
  user.verifyTokenExpiry = tokenExpiry;
  await user.save();

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = req.headers.host;
  const verifyLink = `${protocol}://${host}/verifyEmail?token=${verifyToken}&email=${email}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Pizza Wizza" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email — Pizza Wizza",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Email Verification</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyLink}"
           style="display: inline-block; background: linear-gradient(to right, #4338ca, #7c3aed, #ea580c); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Verify My Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
      </div>
    `,
  });

  return res
    .status(200)
    .json({ message: "Verification email sent! Please check your inbox." });
}
