// Last edited by you@example.com @ 09/09/26 15:08.
// pages/api/addFood.js
import PizzaData from "@/models/pizzaData";
import db from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await db.connect();

  const { name, category, foodType, price, description, img } = req.body;

  if (!name || !category || !foodType || !price || !description || !img) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newItem = new PizzaData({
    name,
    category,
    foodType,
    price,
    description,
    img,
  });
  await newItem.save();

  return res
    .status(201)
    .json({ message: "Item added successfully!", data: newItem });
}
