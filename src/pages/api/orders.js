// Last edited by you@example.com @ 10/09/26 10:43.
// pages/api/orders.js
import Order from "@/models/Order";
import db from "@/utils/db";

export default async function handler(req, res) {
  await db.connect();

  if (req.method === "GET") {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  }

  if (req.method === "PATCH") {
    const { id, status } = req.body;
    if (!id || !status) {
      return res
        .status(400)
        .json({ error: "Order ID and status are required." });
    }
    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ error: "Order not found." });
    }
    return res
      .status(200)
      .json({ message: "Status updated successfully.", order: updated });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Order ID is required." });
    }
    await Order.findByIdAndDelete(id);
    return res.status(200).json({ message: "Order deleted successfully." });
  }

  return res.status(405).json({ error: "Method not allowed." });
}
