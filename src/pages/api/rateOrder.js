// Last edited by you@example.com @ 16/09/26 09:00.
// src/pages/api/rateOrder.js
import Order from "@/models/Order";
import db from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { orderId, rating, review, userEmail } = req.body;

  if (!orderId || !rating || !userEmail) {
    return res
      .status(400)
      .json({ error: "Order ID, rating and email are required." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  // Sirf order ka owner rate kar sake
  if (order.userEmail !== userEmail) {
    return res
      .status(403)
      .json({ error: "You can only rate your own orders." });
  }

  // Sirf delivered orders rate ho sakte hain
  if (order.status !== "Delivered") {
    return res
      .status(400)
      .json({ error: "You can only rate delivered orders." });
  }

  order.rating = rating;
  order.review = review || "";
  order.ratedAt = new Date();
  await order.save();

  return res
    .status(200)
    .json({ message: "Thank you for your feedback!", order });
}
