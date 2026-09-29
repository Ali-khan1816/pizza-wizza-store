// Last edited by you@example.com @ 16/09/26 08:56.
// src/models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    items: [
      {
        id: { type: String },
        name: { type: String, required: true },
        img: { type: String },
        priceOption: { type: String },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    deliveryAddress: { type: String, default: "" },

    // Estimated delivery
    estimatedDelivery: { type: String, default: "30-45 minutes" },

    // Rating — sirf Delivered orders pe
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: "" },
    ratedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
