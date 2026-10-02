"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();
    e.stopPropagation();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {

        setError(
          data.message ||
          "Invalid email or password."
        );

        setLoading(false);

        return;
      }

      /*
      ========================================
      LOGIN SUCCESS
      ========================================
      */

      console.log(
        "ADMIN LOGIN SUCCESS"
      );

      /*
      ========================================
      IMPORTANT

      Use a full browser navigation after
      the cookie has been set by the API.
      ========================================
      */

      window.location.href = "/admin";

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to login. Please try again."
      );

      setLoading(false);
    }
  };


  return (

    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8 text-center">

          <h1 className="text-2xl font-bold text-gray-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the administration dashboard.
          </p>

        </div>


        {error && (

          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>

        )}


        <form
          method="POST"
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="admin@example.com"
            />

          </div>


          {/* PASSWORD */}

          <div>

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your password"
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>

      </div>

    </div>

  );
}