// Last edited by you@example.com @ 15/09/26 10:58.
// src/pages/api/auth/signup.js
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { name, email, password, geolocation } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Agar exist karta hai lekin verified nahi — dobara email bhejo
    if (!existingUser.isVerified) {
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

      existingUser.verifyToken = verifyToken;
      existingUser.verifyTokenExpiry = tokenExpiry;
      await existingUser.save();

      await sendVerificationEmail(
        email,
        existingUser.name,
        verifyToken,
        req.headers.host,
      );
      return res.status(200).json({
        message:
          "A new verification email has been sent. Please check your inbox.",
      });
    }
    return res.status(400).json({ error: "This email is already registered." });
  }

  // Verify token generate karo
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    geolocation: geolocation || "",
    isVerified: false,
    verifyToken,
    verifyTokenExpiry: tokenExpiry,
  });

  await user.save();

  // Verification email bhejo
  await sendVerificationEmail(email, name, verifyToken, req.headers.host);

  return res.status(201).json({
    message:
      "Account created! Please check your email to verify your account before logging in.",
  });
}

async function sendVerificationEmail(email, name, token, host) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const verifyLink = `${protocol}://${host}/verifyEmail?token=${token}&email=${email}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Pizza Wizza" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email — Pizza Wizza",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to Pizza Wizza! 🍕</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please verify your email address to activate your account.</p>
        <a href="${verifyLink}"
           style="display: inline-block; background: linear-gradient(to right, #4338ca, #7c3aed, #ea580c); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Verify My Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Pizza Wizza — Your favourite pizza place</p>
      </div>
    `,
  });
}
