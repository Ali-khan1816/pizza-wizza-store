import User from "@/models/User";
import db from "@/utils/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed.",
    });
  }

  try {
    await db.connect();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 1000 * 60 * 30;

    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;

    await user.save();

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    const host = req.headers.host;

    const resetLink =
      `${protocol}://${host}/resetPassword` +
      `?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test Gmail SMTP authentication
    await transporter.verify();

    console.log("Gmail SMTP connection successful.");

    const info = await transporter.sendMail({
      from: `"Pizza Wizza" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request — Pizza Wizza",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>

          <p>Hi ${user.name},</p>

          <p>
            We received a request to reset your Pizza Wizza account password.
          </p>

          <p>
            Click the button below to reset your password:
          </p>

          <a
            href="${resetLink}"
            style="
              display: inline-block;
              background: #4f46e5;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              margin: 16px 0;
            "
          >
            Reset Password
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 30 minutes.
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this password reset, you can safely ignore
            this email.
          </p>
        </div>
      `,
    });

    console.log("Email accepted by Gmail:", info.messageId);
    console.log("Email response:", info.response);

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD EMAIL ERROR:");
    console.error(error);

    return res.status(500).json({
      error: "Unable to send password reset email.",
    });
  }
}
