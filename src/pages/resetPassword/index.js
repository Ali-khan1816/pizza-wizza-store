// src/pages/resetPassword/index.js
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // router.query pehle empty hota hai — isReady hone ka wait karo
  useEffect(() => {
    if (!router.isReady) return;

    // URL se manually token aur email nikalo
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const e = params.get("email");

    if (!t || !e) {
      setError("Invalid or expired reset link. Please request a new one.");
      setReady(true);
      return;
    }

    setToken(t);
    setEmail(e);
    setReady(true);
  }, [router.isReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error);
        return;
      }

      setMsg(json.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Page ready hone tak loading dikhao
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter your new password below.
          </p>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {msg && (
            <p className="text-green-500 text-sm mb-4">
              ✅ {msg} Redirecting to login...
            </p>
          )}

          {!error.includes("Invalid or expired") && (
            <button
              type="submit"
              disabled={loading || !!msg}
              className="border font-bold text-gray-900 dark:text-gray-100 dark:border-gray-400 border-gray-900 rounded p-2 mr-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          )}

          <Link href="/login" style={{ all: "unset" }}>
            <button className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100">
              Back to Login
            </button>
          </Link>

          {error.includes("Invalid or expired") && (
            <div className="mt-4">
              <Link href="/forgotPassword" style={{ all: "unset" }}>
                <button className="border text-indigo-600 dark:text-indigo-400 font-bold border-indigo-600 dark:border-indigo-400 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-white">
                  Request New Reset Link
                </button>
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
