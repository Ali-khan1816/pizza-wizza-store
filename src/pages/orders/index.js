// Last edited by you@example.com @ 23/09/26 11:50.
// src/pages/orders/index.js

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CartContext } from "@/utils/ContextReducer";

// ── Star Rating Component ─────────────────────────────────────────
const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-transform ${
            !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
        >
          <span
            className={
              (hovered || value) >= star
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

const Orders = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(CartContext);

  const [user, setUser] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  // Rating state
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingMsg, setRatingMsg] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  // Countdown timer state
  const [countdown, setCountdown] = useState(null);

  // ── Load logged-in user ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      if (parsedUser.geolocation) {
        setDeliveryAddress(parsedUser.geolocation);
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  // ── Countdown timer — starts after order is placed ─────────────
  useEffect(() => {
    // No successful order = no countdown
    if (!successOrder) {
      setCountdown(null);
      return;
    }

    let minutes = 40;
    let seconds = 0;

    // Show initial time immediately
    setCountdown(`${minutes}:${String(seconds).padStart(2, "0")}`);

    const interval = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
          setCountdown("Arriving soon!");
          return;
        }

        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }

      setCountdown(`${minutes}:${String(seconds).padStart(2, "0")}`);
    }, 1000);

    // Important:
    // Stop the interval when component unmounts
    // or when successOrder changes.
    return () => {
      clearInterval(interval);
    };
  }, [successOrder]);

  // ── Calculate total ─────────────────────────────────────────────
  const totalAmount = state.reduce(
    (total, food) => total + Number(food.price || 0),
    0,
  );

  // ── Fetch user's orders ─────────────────────────────────────────
  const fetchOrders = async (currentUser) => {
    if (!currentUser) return;

    setOrdersLoading(true);

    try {
      const res = await fetch("/api/orders");

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();

      const userOrders = (data.orders || []).filter(
        (order) =>
          String(order.userId) === String(currentUser.id) ||
          order.userEmail === currentUser.email,
      );

      setOrders(userOrders);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ── Load orders after user is available ─────────────────────────
  useEffect(() => {
    fetchOrders(user);
  }, [user]);

  // ── Confirm / Place order ───────────────────────────────────────
  const handleConfirmOrder = async () => {
    setError("");
    setSuccessOrder(null);

    if (!user) {
      router.push("/login");
      return;
    }

    if (!state?.length) {
      setError("Your cart is empty. Please add some items first.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/placeOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          items: state,
          totalAmount,
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to place your order.");
        return;
      }

      setSuccessOrder(data.order);

      // Clear cart
      dispatch({ type: "DROP" });

      // Add new order to history
      setOrders((prev) => [data.order, ...prev]);
    } catch {
      setError("Something went wrong while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  // ── Submit rating ───────────────────────────────────────────────
  const handleSubmitRating = async (orderId) => {
    if (!ratingValue) {
      setRatingMsg("Please select a star rating.");
      return;
    }

    setRatingLoading(true);
    setRatingMsg("");

    try {
      const res = await fetch("/api/rateOrder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          rating: ratingValue,
          review: reviewText,
          userEmail: user.email,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setRatingMsg(json.error);
        return;
      }

      setRatingMsg("✅ " + json.message);

      setRatingOrderId(null);
      setRatingValue(0);
      setReviewText("");

      // Refresh orders after rating
      fetchOrders(user);
    } catch {
      setRatingMsg("Something went wrong. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  // ── Status styling ──────────────────────────────────────────────
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";

      case "Preparing":
        return "bg-blue-100 text-blue-700 border-blue-300";

      case "Out for Delivery":
        return "bg-purple-100 text-purple-700 border-purple-300";

      case "Delivered":
        return "bg-green-100 text-green-700 border-green-300";

      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-300";

      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // ── Format date ─────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  // ── Loading state ───────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>

          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              ORDERS
            </span>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Orders
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Review your cart, confirm your delivery details, and place your
            pizza order.
          </p>
        </div>

        {/* ── Success Card ── */}
        {successOrder && (
          <div className="mb-8 rounded-xl border border-green-400 bg-green-50 dark:bg-green-950/40 p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✓</span>

                  <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                    Order Confirmed!
                  </h2>
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  Your order has been successfully placed.
                </p>
              </div>

              <span
                className={`inline-block border rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                  successOrder.status,
                )}`}
              >
                {successOrder.status}
              </span>
            </div>

            {/* Order details grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Order ID
                </p>

                <p className="font-semibold text-gray-800 dark:text-gray-100 break-all text-xs">
                  #{successOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total Amount
                </p>

                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                  Rs. {Number(successOrder.totalAmount).toFixed(0)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Payment
                </p>

                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  💵 Cash on Delivery
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Delivery Address
                </p>

                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  {successOrder.deliveryAddress}
                </p>
              </div>
            </div>

            {/* Estimated Delivery Countdown */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-4xl">🛵</div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Estimated Delivery Time
                  </p>

                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Your pizza is being prepared and will arrive in
                    approximately 30-45 minutes.
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                    {countdown}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">remaining</p>
                </div>
              </div>

              {/* Progress steps */}
              <div className="mt-5 flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>

                <div
                  className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 z-0"
                  style={{ width: "16%" }}
                ></div>

                {[
                  {
                    icon: "✓",
                    label: "Confirmed",
                    done: true,
                  },
                  {
                    icon: "👨‍🍳",
                    label: "Preparing",
                    done: false,
                  },
                  {
                    icon: "🛵",
                    label: "On the way",
                    done: false,
                  },
                  {
                    icon: "🏠",
                    label: "Delivered",
                    done: false,
                  },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        step.done
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>

                    <p
                      className={`text-xs mt-1.5 font-semibold ${
                        step.done
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Confirm Order ── */}
        {!successOrder && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border-gradient p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Confirm Your Order
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Check your items before placing the order.
                </p>
              </div>

              <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                {state.length} Item{state.length !== 1 ? "s" : ""}
              </span>
            </div>

            {state.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🛒</div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Your cart is empty
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add some delicious pizzas before confirming your order.
                </p>

                <Link href="/">
                  <button
                    type="button"
                    className="border border-gray-900 dark:border-gray-400 rounded-lg px-5 py-2 font-bold text-gray-900 dark:text-gray-100 hover:bg-gradient-to-r hover:from-indigo-700 hover:via-violet-700 hover:to-orange-700 hover:text-white transition"
                  >
                    Browse Menu
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3 mb-8">
                  {state.map((food, index) => (
                    <div
                      key={food.tempId || `${food.name}-${index}`}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {food.img && (
                          <img
                            src={food.img}
                            alt={food.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}

                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">
                            {food.name}
                          </h3>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {food.size && (
                              <span className="capitalize">{food.size} · </span>
                            )}
                            Qty: {food.qty || 1}
                          </p>
                        </div>
                      </div>

                      <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                        Rs. {Number(food.price || 0).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-2">
                    Delivery Address
                  </label>

                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows="3"
                    className="shadow appearance-none border border-gray-300 dark:border-gray-700 rounded-lg w-full py-3 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-indigo-700 focus:outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-3">
                    Payment Method
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === "cod"
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-xl flex-shrink-0">
                        💵
                      </div>

                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          Cash on Delivery
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Pay when your order arrives
                        </p>
                      </div>

                      {paymentMethod === "cod" && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="white"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Online Payment */}
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl flex-shrink-0">
                        💳
                      </div>

                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          Online Payment
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          JazzCash / EasyPaisa — Coming Soon
                        </p>
                      </div>

                      <span className="ml-auto text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        Soon
                      </span>
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">
                      Order Summary
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal ({state.length} items)</span>

                        <span>Rs. {Number(totalAmount).toFixed(0)}</span>
                      </div>

                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Delivery Fee</span>

                        <span className="text-green-600 font-semibold">
                          Free
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Estimated Delivery</span>

                        <span className="font-semibold text-orange-600">
                          🕐 30-45 minutes
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Payment Method</span>

                        <span className="font-semibold">
                          {paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Online"}
                        </span>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base">
                        <span>Total</span>

                        <span>Rs. {Number(totalAmount).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white font-bold py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Placing Order...
                      </span>
                    ) : (
                      `Place Order · Rs. ${Number(totalAmount).toFixed(0)}`
                    )}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 p-4">
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Order History ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Order History
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track and rate your previous orders.
              </p>
            </div>

            <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold">
              {orders.length}
            </span>
          </div>

          {ordersLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-700 mx-auto mb-3"></div>

              <p className="text-gray-500 dark:text-gray-400">
                Loading your orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-gradient p-8 text-center">
              <div className="text-5xl mb-4">🍕</div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No orders yet
              </h3>

              <p className="text-gray-500 dark:text-gray-400 mb-5">
                Your completed orders will appear here.
              </p>

              <Link href="/">
                <button
                  type="button"
                  className="border border-gray-900 dark:border-gray-400 rounded-lg px-5 py-2 font-bold text-gray-900 dark:text-gray-100 hover:bg-gradient-to-r hover:from-indigo-700 hover:via-violet-700 hover:to-orange-700 hover:text-white transition"
                >
                  Order Now
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-gradient p-6"
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Order ID
                      </p>

                      <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 text-sm">
                      Items
                    </h3>

                    <div className="space-y-1.5">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={item.tempId || `${item.name}-${index}`}
                          className="flex justify-between gap-3 text-sm border-b border-gray-100 dark:border-gray-800 pb-1.5"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.name}

                            {item.qty && (
                              <span className="text-gray-500 ml-1">
                                × {item.qty}
                              </span>
                            )}
                          </span>

                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            Rs. {Number(item.price || 0).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment + Delivery */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Payment:
                    </span>

                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {order.paymentMethod === "cod"
                        ? "💵 Cash on Delivery"
                        : "💳 Online"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Delivery Address
                    </p>

                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {order.deliveryAddress || "Not provided"}
                    </p>
                  </div>

                  {/* ── Rating Section ── */}
                  {order.status === "Delivered" && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                      {order.rating ? (
                        // Already rated
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                            Your Rating
                          </p>

                          <StarRating value={order.rating} readonly />

                          {order.review && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              "{order.review}"
                            </p>
                          )}

                          <p className="text-xs text-gray-400 mt-1">
                            Rated on{" "}
                            {new Date(order.ratedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : ratingOrderId === order._id ? (
                        // Rating form open
                        <div>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                            Rate this order
                          </p>

                          <StarRating
                            value={ratingValue}
                            onChange={setRatingValue}
                          />

                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience (optional)..."
                            rows={2}
                            className="mt-3 w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-indigo-500 focus:outline-none"
                          />

                          {ratingMsg && (
                            <p
                              className={`text-xs mt-1 font-semibold ${
                                ratingMsg.startsWith("✅")
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {ratingMsg}
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleSubmitRating(order._id)}
                              disabled={ratingLoading}
                              className="flex-1 bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white font-bold py-2 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
                            >
                              {ratingLoading
                                ? "Submitting..."
                                : "Submit Rating"}
                            </button>

                            <button
                              onClick={() => {
                                setRatingOrderId(null);
                                setRatingValue(0);
                                setReviewText("");
                                setRatingMsg("");
                              }}
                              className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Rate button
                        <button
                          onClick={() => {
                            setRatingOrderId(order._id);
                            setRatingMsg("");
                          }}
                          className="w-full border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold py-2 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition flex items-center justify-center gap-2"
                        >
                          <span>★</span>
                          Rate this Order
                        </button>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>

                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                      Rs. {Number(order.totalAmount || 0).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
