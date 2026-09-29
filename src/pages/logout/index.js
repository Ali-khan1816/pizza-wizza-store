// Last edited by you@example.com @ 08/09/26 11:32.
// adminLogin.jsx  –  Admin-only login gate
import Link from "next/link";
import React, { useState } from "react";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    adminId: "",
    email: "",
    password: "",
    secretKey: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Admin auth logic comes when backend is created
    // console.log(credentials);
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
          {/* Admin badge header */}
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              ADMIN
            </span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Admin Portal
            </h2>
          </div>

          {/* Admin ID */}
          <div className="mb-4">
            <label
              htmlFor="adminId"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Admin ID
            </label>
            <input
              placeholder="Enter your admin ID"
              name="adminId"
              onChange={handleChange}
              type="text"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
              value={credentials.adminId}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              placeholder="Enter your admin email"
              name="email"
              onChange={handleChange}
              type="email"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
              value={credentials.email}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              placeholder="*******"
              name="password"
              onChange={handleChange}
              type="password"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
              value={credentials.password}
            />
          </div>

          {/* Secret Key */}
          <div className="mb-6">
            <label
              htmlFor="secretKey"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Secret Key
            </label>
            <input
              placeholder="Enter your secret access key"
              name="secretKey"
              onChange={handleChange}
              type="password"
              required
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 focus:border-indigo-700 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
              value={credentials.secretKey}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="submit"
              className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100"
            >
              Access Admin Panel
            </button>
            <Link href={"/login"} style={{ all: "unset" }}>
              <button className="border text-gray-900 dark:text-gray-100 font-bold dark:border-gray-400 border-gray-900 rounded mr-2 p-2 hover:bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 hover:text-gray-100">
                Back to Login
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
