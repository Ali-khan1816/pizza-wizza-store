// Last edited by you@example.com @ 23/09/26 14:49.
// src/pages/contactUs/index.js

import React, { useState } from "react";
import Head from "next/head";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Remove old messages when user starts typing again
    setSent(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSending(true);
    setSent(false);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send your message.");
      }

      // Success
      setSent(true);

      // Clear form
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSent(false);
      }, 5000);
    } catch (err) {
      console.error("Contact form error:", err);

      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Pizza Wizza</title>

        <meta
          name="description"
          content="Contact Pizza Wizza for questions, feedback and support."
        />
      </Head>

      <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        {/* ================= TOP SECTION ================= */}
        <section className="relative overflow-hidden">
          {/* Small gradient accent */}
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-orange-500" />

          <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:px-8 lg:px-10 lg:pb-24 lg:pt-28">
            <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              {/* ================= LEFT ================= */}
              <div>
                {/* Brand mark */}
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-orange-500 text-xl shadow-md">
                    🍕
                  </div>

                  <div>
                    <p className="text-sm font-extrabold tracking-wide text-gray-900 dark:text-white">
                      PIZZA WIZZA
                    </p>

                    <div className="mt-1 h-[2px] w-8 bg-gradient-to-r from-violet-600 to-orange-500" />
                  </div>
                </div>

                {/* Heading */}
                <h1 className="max-w-lg text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                  Contact
                  <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-orange-500 bg-clip-text text-transparent">
                    Pizza Wizza
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-gray-500 dark:text-gray-400">
                  Have a question about your order, our menu, or delivery? Send
                  us a message and our team will be happy to help.
                </p>

                {/* ================= CONTACT DETAILS ================= */}
                <div className="mt-10 max-w-md">
                  {/* Phone */}
                  <div className="flex items-center gap-4 border-b border-gray-200 py-5 dark:border-gray-800">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg dark:bg-indigo-950/50">
                      ☎
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        +92317-5585860
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4 border-b border-gray-200 py-5 dark:border-gray-800">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-lg dark:bg-violet-950/50">
                      ✉
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-gray-800 dark:text-gray-200">
                        alimuhammadk360@gmail.com
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-4 py-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg dark:bg-orange-950/50">
                      📍
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Address
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Blue Area, Jinnah Avenue, Islamabad, Pakistan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT FORM ================= */}
              <div className="relative">
                {/* Small decorative line */}
                <div className="absolute -left-3 top-8 h-16 w-[3px] rounded-full bg-gradient-to-b from-indigo-600 to-orange-500 lg:-left-6" />

                <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 dark:border-gray-800 dark:bg-gray-900/60 sm:p-8">
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                      Get in touch
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      Send us a message
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      We&apos;ll get back to you as soon as possible.
                    </p>
                  </div>

                  {/* ================= SUCCESS MESSAGE ================= */}
                  {sent && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
                      <span className="text-lg">✓</span>

                      <div>
                        <p>Message sent successfully!</p>

                        <p className="mt-1 text-xs font-normal">
                          Your message has been saved and our team has been
                          notified by email.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ================= ERROR MESSAGE ================= */}
                  {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                      <span className="text-lg">!</span>

                      <div>
                        <p>Message could not be sent.</p>

                        <p className="mt-1 text-xs font-normal">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* ================= FORM ================= */}
                  <form onSubmit={handleSubmit}>
                    {/* Name + Email */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          Name
                        </label>

                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                          disabled={sending}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          Email
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          disabled={sending}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mt-5">
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Mobile Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+92 XXX XXXXXXX"
                        disabled={sending}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </div>

                    {/* Subject */}
                    <div className="mt-5">
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Subject
                      </label>

                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="What can we help you with?"
                        required
                        disabled={sending}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </div>

                    {/* Message */}
                    <div className="mt-5">
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Message
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Write your message..."
                        rows={5}
                        required
                        disabled={sending}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={sending}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {sending ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <span className="text-lg">→</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BOTTOM BRAND STRIP ================= */}
        <section className="border-t border-gray-100 dark:border-gray-900">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-orange-500 text-sm">
                🍕
              </div>

              <span className="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-300">
                Pizza Wizza
              </span>
            </div>

            <p className="text-center text-xs text-gray-400 sm:text-right">
              Good food. Great moments. Always Pizza Wizza.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
