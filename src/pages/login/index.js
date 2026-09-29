// Last edited by you@example.com @ 15/09/26 10:55.
// src/pages/login/index.js
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const signupSuccess = router.query.signup === "success";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotVerified(false);
    setResendMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();

      if (!res.ok) {
        // Email not verified case
        if (json.notVerified) {
          setNotVerified(true);
          setResendEmail(json.email);
          setError(json.error);
          return;
        }
        setError(json.error);
        return;
      }

      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user));
      router.push("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resendVerification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const json = await res.json();
      setResendMsg(json.message || json.error);
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
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
          {signupSuccess && (
            <div className="bg-green-50 dark:bg-green-950/40 border border-green-300 rounded-lg p-3 mb-4">
              <p className="text-green-700 dark:text-green-400 text-sm font-bold">
                ✅ Account created! Please check your email to verify your
                account before logging in.
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <input
              placeholder="Enter your email address"
              name="email"
              onChange={handleChange}
              type="email"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none"
              value={credentials.email}
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              placeholder="Enter your password"
              name="password"
              onChange={handleChange}
              type="password"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none"
              value={credentials.password}
            />
          </div>

          <div className="mb-4 text-right">
            <Link
              href="/forgotPassword"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-300 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                {error}
              </p>

              {/* Email not verified — resend option */}
              {notVerified && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline disabled:opacity-50"
                  >
                    {resendLoading
                      ? "Sending..."
                      : "Resend verification email →"}
                  </button>
                  {resendMsg && (
                    <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                      {resendMsg}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
          <Link href="/signup" style={{ all: "unset" }}>
            <button className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100">
              Create Account
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
