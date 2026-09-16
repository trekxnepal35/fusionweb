"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /*
  ==============================================
  HANDLE INPUT
  ==============================================
  */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /*
  ==============================================
  SUBMIT FORM
  ==============================================
  */

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccess("");
    setError("");

    /*
    ============================================
    BASIC VALIDATION
    ============================================
    */

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please enter your message.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send your message."
        );
      }

      /*
      ==========================================
      SUCCESS
      ==========================================
      */

      setSuccess(
        data.message ||
          "Your message has been sent successfully."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("CONTACT FORM ERROR:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ==========================================
          HERO
      ========================================== */}

      <section className="bg-gray-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
            Get in Touch
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-300 md:text-lg">
            Have a question or need more information?
            Send us a message and our team will get back
            to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ==========================================
          CONTACT CONTENT
      ========================================== */}

      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
          {/* ========================================
              CONTACT INFORMATION
          ======================================== */}

          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Get in Touch
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              We are happy to answer your questions,
              provide information, and help you plan
              your next adventure.
            </p>

            <div className="mt-8 space-y-6">
              {/* EMAIL */}

              <div>
                <h3 className="font-semibold text-gray-900">
                  Email
                </h3>

                <p className="mt-1 text-gray-600">
                  info@example.com
                </p>
              </div>

              {/* PHONE */}

              <div>
                <h3 className="font-semibold text-gray-900">
                  Phone
                </h3>

                <p className="mt-1 text-gray-600">
                  +977-XXXXXXXXXX
                </p>
              </div>

              {/* ADDRESS */}

              <div>
                <h3 className="font-semibold text-gray-900">
                  Address
                </h3>

                <p className="mt-1 leading-6 text-gray-600">
                  Kathmandu, Nepal
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
              CONTACT FORM
          ======================================== */}

          <div className="rounded-2xl bg-white p-7 shadow-sm lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Send Us a Message
            </h2>

            <p className="mt-2 text-gray-600">
              Fill out the form below and we will
              respond to your message.
            </p>

            {/* ======================================
                SUCCESS MESSAGE
            ====================================== */}

            {success && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* ======================================
                ERROR MESSAGE
            ====================================== */}

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              {/* NAME + EMAIL */}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    maxLength={150}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* PHONE + SUBJECT */}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+977..."
                    maxLength={50}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Subject *
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    maxLength={200}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* MESSAGE */}

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Message *
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={7}
                  maxLength={3000}
                  required
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <div className="mt-1 text-right text-xs text-gray-500">
                  {formData.message.length}/3000
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gray-900 px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}