// Last edited by you@example.com @ 15/09/26 11:20.
// src/pages/profile/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    geolocation: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);
    setForm((f) => ({
      ...f,
      name: parsedUser.name || "",
      geolocation: parsedUser.geolocation || "",
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/updateProfile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          geolocation: form.geolocation,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error);
        return;
      }

      // localStorage update karo
      const updatedUser = {
        ...user,
        name: json.user.name,
        geolocation: json.user.geolocation,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMsg(json.message);

      // Password fields clear karo
      setForm((f) => ({
        ...f,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  const inputClass =
    "shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 dark:bg-gray-800 leading-tight focus:outline-none";
  const labelClass =
    "block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2";

  return (
    <div
      style={{
        minHeight: "90vh",
        backgroundImage:
          'url("https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
      className="py-10 px-4"
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">
              {user.name}
            </h1>
            <p className="text-white/70 text-sm">{user.email}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl px-8 py-6 space-y-5"
        >
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
            Edit Profile
          </h2>

          {/* Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
              className={inputClass}
            />
          </div>

          {/* Email — readonly */}
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed.
            </p>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Delivery Address</label>
            <textarea
              value={form.geolocation}
              onChange={(e) =>
                setForm({ ...form, geolocation: e.target.value })
              }
              placeholder="Your delivery address"
              rows={2}
              className={inputClass}
            />
          </div>

          {/* Password section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Change Password{" "}
              <span className="text-gray-400 font-normal normal-case">
                (optional)
              </span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          )}
          {msg && (
            <p className="text-green-500 text-sm font-semibold">✅ {msg}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/" style={{ all: "unset" }}>
              <button
                type="button"
                className="border font-bold text-gray-900 dark:text-gray-100 dark:border-gray-400 border-gray-900 rounded-lg px-5 py-2.5 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-white hover:border-transparent"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
