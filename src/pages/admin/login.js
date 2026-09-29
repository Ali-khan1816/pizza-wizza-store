// Last edited by you@example.com @ 23/09/26 09:45.
// src/pages/admin/login.js
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const timeoutMsg = router.query.reason === "timeout";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/adminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        height: "90vh",
        backgroundImage:
          'url("https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        backgroundSize: "cover",
      }}
      className="flex justify-center items-center"
    >
      <div className="container w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 dark:bg-gray-900 dark:text-gray-100 border-gradient rounded-lg shadow-2xl px-8 pt-6 pb-8 mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              ADMIN
            </span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Admin Portal
            </h2>
          </div>

          {timeoutMsg && (
            <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 rounded-lg p-3 mb-4">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm font-bold">
                ⏱ Session expired due to inactivity. Please log in again.
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Admin Email
            </label>
            <input
              placeholder="Enter admin email"
              name="email"
              onChange={handleChange}
              type="email"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none"
              value={credentials.email}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Admin Password
            </label>
            <input
              placeholder="Enter admin password"
              name="password"
              onChange={handleChange}
              type="password"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none"
              value={credentials.password}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded p-2 mr-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Access Admin Panel"}
          </button>
          <Link href="/" style={{ all: "unset" }}>
            <button className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100">
              Back to Home
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
