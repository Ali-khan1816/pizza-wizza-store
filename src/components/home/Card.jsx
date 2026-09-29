// Last edited by you@example.com @ 16/09/26 09:14.
// src/components/home/Card.jsx
import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { CartContext } from "@/utils/ContextReducer";

// ── Public Star Display ───────────────────────────────────────────
const StarDisplay = ({ rating, total }) => {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-base ${
              star <= Math.round(rating)
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
        {rating}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        ({total} review{total !== 1 ? "s" : ""})
      </span>
    </div>
  );
};

const Card = (props) => {
  const data = props.foodData;
  const router = useRouter();
  const itemId = data._id || data.id;

  const priceOptions = Object.keys(data.price);
  const { state, dispatch } = useContext(CartContext);

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(priceOptions[0]);

  const finalPrice = qty * parseInt(data.price[size]);

  const handleQty = (e) => setQty(parseInt(e.target.value));
  const handleSize = (e) => setSize(e.target.value);

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const tempId = itemId + size;
    const existingItem = state.find((item) => item.tempId === tempId);

    if (!existingItem) {
      dispatch({
        type: "ADD",
        id: itemId,
        tempId,
        name: data.name,
        price: finalPrice,
        qty,
        priceOption: size,
        img: data.img,
      });
    } else {
      dispatch({
        type: "UPDATE",
        tempId,
        price: existingItem.price + finalPrice,
        qty: existingItem.qty + qty,
      });
    }
  };

  return (
    <div className="box">
      <div className="w-80 bg-white rounded-lg border-gradient overflow-hidden dark:bg-black">
        {/* Image */}
        <div className="w-full h-80 overflow-hidden">
          <img
            src={data.img}
            alt={data.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/pizza1.jpg";
            }}
          />
        </div>

        {/* Name + Rating + Description */}
        <div className="p-4">
          <h2 className="font-bold mb-1 text-xl uppercase text-black dark:text-white">
            {data.name}
          </h2>

          {/* ── Public Rating Stars ── */}
          <StarDisplay rating={data.averageRating} total={data.totalRatings} />

          {/* No ratings yet */}
          {!data.averageRating && (
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="text-base text-gray-300 dark:text-gray-600"
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                No reviews yet
              </span>
            </div>
          )}

          <p className="text-sm mb-2 line-clamp-2 text-black dark:text-white">
            {data.description}
          </p>
        </div>

        {/* Quantity + Size */}
        <div className="flex px-4 justify-between">
          <select
            className="h-10 mb-1 p-1 text-black hover:font-bold font-semibold cursor-pointer dark:text-gray-400 border-black dark:border-gray-300 rounded"
            onChange={handleQty}
            value={qty}
          >
            {Array.from(Array(6), (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <select
            className="h-10 w-30 text-center uppercase mb-1 p-2 text-black hover:font-bold font-semibold cursor-pointer dark:text-gray-400 border-black dark:border-gray-300 rounded"
            onChange={handleSize}
            value={size}
          >
            {priceOptions.map((option) => (
              <option className="uppercase" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Add to Cart + Price */}
        <div className="flex p-4 justify-between items-center">
          <button
            type="button"
            onClick={handleAddToCart}
            className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100"
          >
            Add to cart
          </button>
          <p className="p-2 text-xl font-bold">{finalPrice} Rs. /-</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
