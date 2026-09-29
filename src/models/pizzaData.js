// Last edited by you@example.com @ 09/09/26 13:19.
// models/pizzaData.js
import mongoose from "mongoose";

const PizzaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    foodType: { type: String, required: true, enum: ["Veg", "Non-Veg"] },
    price: { type: Object, required: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
  },
  { timestamps: true },
);

// Hot reload safe — model already exist karta hai toh dobara mat banao
export default mongoose.models.PizzaData ||
  mongoose.model("PizzaData", PizzaSchema);
