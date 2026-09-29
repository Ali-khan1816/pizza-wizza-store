// Last edited by you@example.com @ 29/09/26 15:28.
// src/pages/api/contact.js

import db from "@/utils/db";
import ContactMessage from "@/models/ContactMessage";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Connect MongoDB
    await db.connect();

    // Save message in database
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      subject: subject.trim(),
      message: message.trim(),
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    // Email sent to you
    await transporter.sendMail({
      from: `"Pizza Wizza Website" <${process.env.CONTACT_EMAIL}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,

      replyTo: email,

      subject: `New Contact Message: ${subject}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: auto;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        ">

          <div style="
            background: linear-gradient(
              90deg,
              #4f46e5,
              #7c3aed,
              #f97316
            );
            padding: 25px;
            color: white;
          ">
            <h2 style="margin: 0;">
              🍕 New Pizza Wizza Contact Message
            </h2>
          </div>

          <div style="padding: 25px;">

            <p>
              <strong>Name:</strong>
              ${escapeHtml(name)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Phone:</strong>
              ${escapeHtml(phone || "Not provided")}
            </p>

            <p>
              <strong>Subject:</strong>
              ${escapeHtml(subject)}
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb;" />

            <p>
              <strong>Message:</strong>
            </p>

            <div style="
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              line-height: 1.6;
              white-space: pre-wrap;
            ">
              ${escapeHtml(message)}
            </div>

            <p style="
              margin-top: 25px;
              color: #6b7280;
              font-size: 13px;
            ">
              This message was submitted from the Pizza Wizza Contact Us page.
            </p>

          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactMessageId: contactMessage._id,
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}

// Prevent HTML injection in email
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
