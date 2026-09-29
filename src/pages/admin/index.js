// Last edited by you@example.com @ 23/09/26 10:48.
// src/pages/admin/index.js

import { verifyAdmin } from "../../utils/adminAuth";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const STATUS_COLORS = {
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Out for Delivery":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Delivered:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_OPTIONS = [
  "Pending",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const inputClass =
  "shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 dark:bg-gray-800 focus:border-indigo-700 focus:outline-none";

const labelClass =
  "block text-gray-700 dark:text-gray-300 text-sm font-bold mb-1";

const btnBase =
  "border font-bold rounded px-4 py-2 text-sm transition-all hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-white hover:border-transparent";

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Menu");
  const [menuTab, setMenuTab] = useState("All");
  const [foodData, setFoodData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [orderFilter, setOrderFilter] = useState("All");
  const [authChecked, setAuthChecked] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageName, setImageName] = useState("");

  const pizzaPrice = ["regular", "medium", "large"];
  const sidesPrice = ["single", "double"];

  const [form, setForm] = useState({
    name: "",
    category: "Pizza",
    foodType: "Veg",
    description: "",
    img: "",
    price: { regular: "", medium: "", large: "" },
  });

  // ── Admin authentication ──────────────────────────────────────
  // Authentication is now handled server-side by getServerSideProps().
  // No localStorage token check is required here.

  // ── Fetch Menu ─────────────────────────────────────────────────
  const fetchMenu = async () => {
    setLoadingMenu(true);

    try {
      const res = await fetch("/api/foodData");
      const json = await res.json();

      setFoodData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMenu(false);
    }
  };

  // ── Fetch Orders ───────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoadingOrders(true);

    try {
      const res = await fetch("/api/orders");
      const json = await res.json();

      setOrders(json.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // ── Fetch Users ────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const res = await fetch("/api/users");
      const json = await res.json();

      setUsers(json.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ── Initial Data Fetch ─────────────────────────────────────────
  useEffect(() => {
    fetchMenu();
    fetchOrders();
    fetchUsers();
  }, []);

  // ── 5 Minute Inactivity Auto-Logout ───────────────────────────
  useEffect(() => {
    if (!authChecked) return;

    const TIMEOUT = 5 * 60 * 1000;
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(async () => {
        await fetch("/api/auth/adminLogout", {
          method: "POST",
        });

        router.push("/admin/login?reason=timeout");
      }, TIMEOUT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((e) => {
      window.addEventListener(e, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);

      events.forEach((e) => {
        window.removeEventListener(e, resetTimer);
      });
    };
  }, [authChecked]);

  // ── Image Upload ───────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("❌ Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg("❌ Image must be smaller than 5 MB.");
      return;
    }

    setUploadingImage(true);
    setMsg("");
    setImageName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const MAX = 1200;

        let w = img.width;
        let h = img.height;

        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);

          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setMsg("❌ Could not process image.");
          setUploadingImage(false);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);

        setForm((prev) => ({
          ...prev,
          img: canvas.toDataURL("image/jpeg", 0.8),
        }));

        setUploadingImage(false);
        setMsg("✅ Image selected successfully.");
      };

      img.onerror = () => {
        setMsg("❌ Could not read the selected image.");
        setUploadingImage(false);
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      setMsg("❌ Could not read the selected file.");
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const todayStr = new Date().toDateString();

  const todayOrders = orders.filter(
    (o) =>
      new Date(o.createdAt).toDateString() === todayStr &&
      o.status !== "Cancelled",
  );

  const todayEarnings = todayOrders.reduce((s, o) => s + o.totalAmount, 0);

  const totalEarnings = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  // ── Delete Menu Item ──────────────────────────────────────────
  const handleDeleteMenu = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const res = await fetch(`/api/foodData?id=${id}`, {
      method: "DELETE",
    });

    const json = await res.json();

    setMsg(res.ok ? `✅ "${name}" has been deleted.` : `❌ ${json.error}`);

    fetchMenu();
  };

  // ── Update Order Status ───────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: orderId,
        status: newStatus,
      }),
    });

    const json = await res.json();

    setMsg(
      res.ok
        ? `✅ Order status updated to "${newStatus}".`
        : `❌ ${json.error}`,
    );

    fetchOrders();
  };

  // ── Delete Order ──────────────────────────────────────────────
  const handleDeleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    const res = await fetch(`/api/orders?id=${id}`, {
      method: "DELETE",
    });

    const json = await res.json();

    setMsg(res.ok ? "✅ Order deleted successfully." : `❌ ${json.error}`);

    fetchOrders();
  };

  // ── Category Change ───────────────────────────────────────────
  const handleCategoryChange = (e) => {
    const cat = e.target.value;

    setForm({
      ...form,
      category: cat,
      price:
        cat === "Pizza"
          ? {
              regular: "",
              medium: "",
              large: "",
            }
          : {
              single: "",
              double: "",
            },
    });
  };

  // ── Add Menu Item ─────────────────────────────────────────────
  const handleAddItem = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.img) {
      setMsg("❌ Please upload an image or enter an image URL.");
      return;
    }

    const res = await fetch("/api/addFood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (!res.ok) {
      setMsg(`❌ ${json.error}`);
      return;
    }

    setMsg("✅ Item added successfully!");
    setShowForm(false);
    setImageName("");

    setForm({
      name: "",
      category: "Pizza",
      foodType: "Veg",
      description: "",
      img: "",
      price: {
        regular: "",
        medium: "",
        large: "",
      },
    });

    fetchMenu();
  };

  // ── Admin Logout ──────────────────────────────────────────────
  const handleAdminLogout = async () => {
    await fetch("/api/auth/adminLogout", {
      method: "POST",
    });

    router.push("/admin/login");
  };

  const menuCategories = ["All", "Pizza", "SIDES & BEVERAGES"];

  const filteredMenu =
    menuTab === "All"
      ? foodData
      : foodData.filter((i) => i.category === menuTab);

  const filteredOrders =
    orderFilter === "All"
      ? orders
      : orders.filter((o) => o.status === orderFilter);

  const priceFields = form.category === "Pizza" ? pizzaPrice : sidesPrice;

  return (
    <div
      style={{
        minHeight: "90vh",
        backgroundImage:
          'url("https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
      className="p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white text-xs font-bold px-3 py-1 rounded-full">
            ADMIN
          </span>

          <h1 className="text-2xl font-bold text-white drop-shadow">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex gap-2">
          <Link href="/" style={{ all: "unset" }}>
            <button className="border text-white font-bold border-white rounded px-4 py-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-white hover:border-transparent">
              ← Back to Home
            </button>
          </Link>

          <button
            onClick={handleAdminLogout}
            className="border text-white font-bold border-white rounded px-4 py-2 hover:bg-red-600 hover:border-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          {
            label: "Today's Earnings",
            value: `Rs. ${todayEarnings.toLocaleString()}`,
            sub: `${todayOrders.length} orders today`,
          },
          {
            label: "Total Earnings",
            value: `Rs. ${totalEarnings.toLocaleString()}`,
            sub: "All time (excl. cancelled)",
          },
          {
            label: "Pending Orders",
            value: pendingCount,
            sub: "Awaiting action",
          },
          {
            label: "Delivered",
            value: deliveredCount,
            sub: "Completed orders",
          },
          {
            label: "Total Users",
            value: users.length,
            sub: "Registered accounts",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl px-5 py-4 text-center"
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {s.value}
            </p>

            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
              {s.label}
            </p>

            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {msg && (
        <p className="mb-4 text-sm font-semibold text-white bg-black bg-opacity-40 px-4 py-2 rounded">
          {msg}
        </p>
      )}

      {/* Main Tabs */}
      <div className="flex gap-2 mb-5">
        {["Menu", "Orders", "Users"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setMsg("");
            }}
            className={`px-5 py-2 rounded font-bold text-sm border transition-all ${
              activeTab === t
                ? "bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white border-transparent"
                : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-400"
            }`}
          >
            {t}

            {t === "Orders" && pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── MENU TAB ── */}
      {activeTab === "Menu" && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMenuTab(cat)}
                  className={`px-4 py-2 rounded font-bold text-sm border transition-all ${
                    menuTab === cat
                      ? "bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white border-transparent"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setMsg("");
              }}
              className={`${btnBase} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-900 dark:border-gray-400`}
            >
              {showForm ? "✕ Cancel" : "+ Add New Item"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAddItem}
              className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl px-8 py-6 mb-6"
            >
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                New Menu Item
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Item Name</label>

                  <input
                    name="name"
                    value={form.name}
                    required
                    placeholder="e.g. CHICKEN TIKKA"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Category</label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleCategoryChange}
                    className={inputClass}
                  >
                    <option value="Pizza">Pizza</option>

                    <option value="SIDES & BEVERAGES">SIDES & BEVERAGES</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Food Type</label>

                  <select
                    name="foodType"
                    value={form.foodType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        foodType: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Veg">Veg</option>

                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Food Image</label>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="foodImage"
                      className="cursor-pointer border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg px-4 py-3 text-center hover:border-indigo-600 transition-colors"
                    >
                      <div className="text-2xl mb-1">📷</div>

                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {uploadingImage
                          ? "Processing image..."
                          : "Choose image from PC / Laptop"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        JPG, JPEG, PNG, WEBP — Max 5 MB
                      </p>
                    </label>

                    <input
                      id="foodImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {imageName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Selected:{" "}
                        <span className="font-semibold">{imageName}</span>
                      </p>
                    )}
                  </div>
                </div>

                {form.img && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>Image Preview</label>

                    <div className="relative w-full max-w-sm">
                      <img
                        src={form.img}
                        alt="Food preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-700 shadow-md"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            img: "",
                          });

                          setImageName("");
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className={labelClass}>Or use Image URL</label>

                  <input
                    name="img"
                    value={form.img.startsWith("data:") ? "" : form.img}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => {
                      setForm({
                        ...form,
                        img: e.target.value,
                      });

                      setImageName("");
                    }}
                    className={inputClass}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    You can either upload an image or paste an image URL.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    required
                    rows={2}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Enter item description..."
                  />
                </div>

                {priceFields.map((field) => (
                  <div key={field}>
                    <label className={labelClass}>
                      Price — {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                      (Rs.)
                    </label>

                    <input
                      type="number"
                      min="0"
                      name={field}
                      required
                      value={form.price[field] || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: {
                            ...form.price,
                            [field]: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 500"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className={`mt-5 ${btnBase} border-gray-900 dark:border-gray-400 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {uploadingImage ? "Processing Image..." : "Save Item"}
              </button>
            </form>
          )}

          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl overflow-x-auto">
            {loadingMenu ? (
              <p className="text-center py-10 text-gray-500">
                Loading menu items...
              </p>
            ) : filteredMenu.length === 0 ? (
              <p className="text-center py-10 text-gray-500">No items found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    {[
                      "#",
                      "Name",
                      "Category",
                      "Type",
                      "Prices (Rs.)",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-gray-700 dark:text-gray-300 font-bold uppercase text-xs tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredMenu.map((item, i) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>

                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white uppercase whitespace-nowrap">
                        {item.name}
                      </td>

                      <td className="px-4 py-3">
                        <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                            item.foodType === "Veg"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {item.foodType}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {Object.entries(item.price).map(([k, v]) => (
                          <span key={k} className="mr-2 text-xs">
                            <span className="font-semibold capitalize">
                              {k}:
                            </span>{" "}
                            {v}
                          </span>
                        ))}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteMenu(item._id, item.name)}
                          className="border border-red-500 text-red-500 font-bold rounded px-3 py-1 text-xs hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "Orders" && (
        <>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl px-6 py-4 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                Today —{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                Rs. {todayEarnings.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {todayOrders.length} order
                {todayOrders.length !== 1 ? "s" : ""} completed today
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                All-time Earnings
              </p>

              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                Rs. {totalEarnings.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {orders.filter((o) => o.status !== "Cancelled").length} total
                delivered/active orders
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {["All", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setOrderFilter(s)}
                className={`px-3 py-1.5 rounded font-bold text-xs border transition-all ${
                  orderFilter === s
                    ? "bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white border-transparent"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-400"
                }`}
              >
                {s}

                {s !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({orders.filter((o) => o.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl overflow-x-auto">
            {loadingOrders ? (
              <p className="text-center py-10 text-gray-500">
                Loading orders...
              </p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                No orders found.
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    {[
                      "#",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                      "Date",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-gray-700 dark:text-gray-300 font-bold uppercase text-xs tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order, i) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 align-top"
                    >
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {order.userEmail}
                        </p>

                        {order.deliveryAddress && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-[140px] truncate">
                            {order.deliveryAddress}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {order.items.map((item, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap"
                          >
                            {item.qty}× {item.name}
                            {item.priceOption && (
                              <span className="text-gray-400 ml-1">
                                ({item.priceOption})
                              </span>
                            )}
                          </p>
                        ))}
                      </td>

                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        Rs. {order.totalAmount.toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="border border-red-500 text-red-500 font-bold rounded px-3 py-1 text-xs hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "Users" && (
        <>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-2xl overflow-x-auto">
            {loadingUsers ? (
              <p className="text-center py-10 text-gray-500">
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <p className="text-center py-10 text-gray-500">No users found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    {[
                      "#",
                      "Name",
                      "Email",
                      "Address",
                      "Verified",
                      "Joined",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-gray-700 dark:text-gray-300 font-bold uppercase text-xs tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {users
                    .filter((u) =>
                      userSearch
                        ? u.name
                            .toLowerCase()
                            .includes(userSearch.toLowerCase()) ||
                          u.email
                            .toLowerCase()
                            .includes(userSearch.toLowerCase())
                        : true,
                    )
                    .map((u, i) => (
                      <tr
                        key={u._id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>

                            <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              {u.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {u.email}
                        </td>

                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                          {u.geolocation || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              u.isVerified
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {u.isVerified ? "✓ Verified" : "✗ Unverified"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   SERVER-SIDE ADMIN PROTECTION
   ──────────────────────────────────────────────────────────────── */

export async function getServerSideProps(context) {
  const admin = verifyAdmin(context.req);

  if (!admin) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
