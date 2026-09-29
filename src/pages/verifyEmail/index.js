// Last edited by you@example.com @ 15/09/26 10:57.
// src/pages/verifyEmail/index.js
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    // API call karo
    fetch(
      `/api/auth/verifyEmail?token=${token}&email=${encodeURIComponent(email)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [router.isReady]);

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
        <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-100 border-gradient rounded-lg shadow-2xl px-8 pt-6 pb-8 mb-4 text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Verifying your email...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link href="/login" style={{ all: "unset" }}>
                <button className="border font-bold text-gray-900 dark:text-gray-100 dark:border-gray-400 border-gray-900 rounded px-6 py-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100">
                  Log In Now
                </button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link href="/signup" style={{ all: "unset" }}>
                <button className="border font-bold text-gray-900 dark:text-gray-100 dark:border-gray-400 border-gray-900 rounded px-6 py-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100">
                  Sign Up Again
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
