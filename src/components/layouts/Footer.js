// Last edited by you@example.com @ 23/09/26 13:38.
import Link from "next/link";
import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="text-white-100 sticky  bg-gradient-to-r from-indigo-700 via-violet-700 to-orange-700 body-font">
      <div className="container mx-auto flex flex-wrap justify-around  p-5 flex-col md:flex-row items-center">
        <Link
          href={"/"}
          className="flex title-font font-extrabold items-center text-white mb-4 md:mb-0"
        >
          <Image
            alt="Pizza Wizza Logo"
            src={"/Pizza.svg"}
            width={60}
            height={60}
          />
          <span className="ml-3 text-xl">PIZZA WIZZA</span>
        </Link>
        {/* Navigation Links */}
        <div className="flex space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300 transition">
            Home
          </Link>
          <Link href="/orders" className="hover:text-yellow-300 transition">
            Orders
          </Link>
          <Link href="/contactUs" className="hover:text-yellow-300 transition">
            Contact Us
          </Link>
        </div>
        <p className="ml-3 text-sm text-gray-300 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
          Copyright &copy; 2024 Pizza Wizza. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
