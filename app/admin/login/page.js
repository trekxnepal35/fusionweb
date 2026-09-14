"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";


export default function AdminLoginPage() {

  const router =
    useRouter();


  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });


  const [loading, setLoading] =
    useState(false);


  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (previous) => ({

        ...previous,

        [name]: value,

      })
    );

  }


  async function handleSubmit(e) {

    e.preventDefault();


    try {

      setLoading(true);


      const response =
        await fetch(
          "/api/admin/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(form),
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        alert(
          result.message ||
            "Login failed."
        );

        return;

      }


      router.push(
        "/admin/navbar"
      );


    } catch (error) {

      console.error(error);


      alert(
        "Unable to login."
      );


    } finally {

      setLoading(false);

    }

  }


  return (

    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-100
        px-4
      "
    >

      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-2xl
          shadow
          p-6
          md:p-8
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            text-center
          "
        >
          Admin Login
        </h1>


        <p
          className="
            text-center
            text-gray-500
            mt-2
            mb-8
          "
        >
          Sign in to manage your website.
        </p>


        <form
          onSubmit={handleSubmit}
          className="
            space-y-5
          "
        >

          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Email
            </label>


            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-black
              "
            />

          </div>


          <div>

            <label
              className="
                block
                font-medium
                mb-2
              "
            >
              Password
            </label>


            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-black
              "
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-black
              text-white
              py-3
              rounded-lg
              font-medium
              hover:bg-gray-800
              disabled:opacity-50
            "
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>

      </div>

    </main>

  );

}