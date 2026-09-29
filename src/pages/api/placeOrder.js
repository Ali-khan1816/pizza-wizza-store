// pages/api/placeOrder.js
import Order from "@/models/Order";
import db from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  await db.connect();

  const { userId, userEmail, items, totalAmount, deliveryAddress } = req.body;

  if (!userId || !userEmail || !items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const newOrder = new Order({
    userId,
    userEmail,
    items,
    totalAmount,
    deliveryAddress: deliveryAddress || "",
    status: "Pending",
  });

  await newOrder.save();
  return res
    .status(201)
    .json({ message: "Order placed successfully!", order: newOrder });
}
