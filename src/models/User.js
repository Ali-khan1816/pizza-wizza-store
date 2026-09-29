// Last edited by you@example.com @ 15/09/26 11:09.
// src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    geolocation: { type: String, default: "" },
    // Email verification
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpiry: { type: Number },
    // Password reset
    resetToken: { type: String },
    resetTokenExpiry: { type: Number },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
