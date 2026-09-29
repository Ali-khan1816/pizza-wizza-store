// Last edited by you@example.com @ 23/09/26 13:32.
// src/pages/api/foodData.js

import PizzaData from "@/models/pizzaData";
import Order from "@/models/Order";
import db from "@/utils/db";

export default async function handler(req, res) {
  try {
    // =========================
    // GET — All food items
    // =========================
    if (req.method === "GET") {
      const totalStart = Date.now();

      // -------------------------
      // Connect to MongoDB
      // -------------------------
      const dbStart = Date.now();

      await db.connect();

      console.log("DB connection time:", Date.now() - dbStart, "ms");

      // -------------------------
      // Get food items
      // -------------------------
      const foodStart = Date.now();

      const data = await PizzaData.find({}).lean();

      console.log(
        "PizzaData query time:",
        Date.now() - foodStart,
        "ms",
        "| Items:",
        data.length,
      );

      // -------------------------
      // Measure total image data
      // -------------------------
      const totalImageBytes = data.reduce((total, item) => {
        return total + (item.img ? item.img.length : 0);
      }, 0);

      console.log(
        "Total image data:",
        (totalImageBytes / 1024).toFixed(2),
        "KB",
      );

      // -------------------------
      // Get rated delivered orders
      // -------------------------
      const orderStart = Date.now();

      const ratedOrders = await Order.find({
        rating: { $ne: null },
        status: "Delivered",
      })
        .select("items.name rating")
        .lean();

      console.log(
        "Order rating query time:",
        Date.now() - orderStart,
        "ms",
        "| Rated orders:",
        ratedOrders.length,
      );

      // -------------------------
      // Create rating map
      // -------------------------
      const ratingStart = Date.now();

      const ratingMap = {};

      for (const order of ratedOrders) {
        if (!Array.isArray(order.items)) continue;

        for (const orderItem of order.items) {
          const itemName = orderItem?.name;

          if (!itemName) continue;

          if (!ratingMap[itemName]) {
            ratingMap[itemName] = {
              totalRatings: 0,
              totalRating: 0,
            };
          }

          ratingMap[itemName].totalRatings += 1;
          ratingMap[itemName].totalRating += Number(order.rating) || 0;
        }
      }

      // -------------------------
      // Add ratings to food items
      // -------------------------
      const dataWithRatings = data.map((item) => {
        const ratingInfo = ratingMap[item.name];

        let averageRating = null;
        let totalRatings = 0;

        if (ratingInfo && ratingInfo.totalRatings > 0) {
          averageRating = Number(
            (ratingInfo.totalRating / ratingInfo.totalRatings).toFixed(1),
          );

          totalRatings = ratingInfo.totalRatings;
        }

        return {
          ...item,
          averageRating,
          totalRatings,
        };
      });

      console.log("Rating calculation time:", Date.now() - ratingStart, "ms");

      // -------------------------
      // Total API time
      // -------------------------
      console.log("TOTAL foodData API time:", Date.now() - totalStart, "ms");

      return res.status(200).json({
        data: dataWithRatings,
      });
    }

    // =========================
    // POST — Bulk seed
    // =========================
    if (req.method === "POST") {
      await db.connect();

      if (!Array.isArray(req.body)) {
        return res.status(400).json({
          error: "Request body must be an array.",
        });
      }

      for (const item of req.body) {
        const pizza = new PizzaData({
          name: item.name,
          category: item.category,
          foodType: item.foodType,
          price: item.price,
          description: item.description,
          img: item.img,
        });

        await pizza.save();
      }

      return res.status(200).json({
        message: "Data saved successfully",
      });
    }

    // =========================
    // DELETE
    // =========================
    if (req.method === "DELETE") {
      await db.connect();

      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          error: "Item ID required",
        });
      }

      await PizzaData.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Item deleted",
      });
    }

    // =========================
    // Method not allowed
    // =========================
    return res.status(405).json({
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("foodData API error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
}
