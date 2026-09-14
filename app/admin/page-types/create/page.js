
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePageTypePage() {

  const router = useRouter();


  const [form, setForm] = useState({

    name: "",

    slug: "",

    description: "",

    imageUrl: "",

    bookable: true,

    published: true,

    order: 0,

  });


  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
  =========================================
  HANDLE CHANGE
  =========================================
  */

  function handleChange(event) {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setForm((current) => ({

      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  }


  /*
  =========================================
  GENERATE SLUG
  =========================================
  */

  function generateSlug() {

    const slug =
      form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");


    setForm((current) => ({

      ...current,

      slug,

    }));

  }


  /*
  =========================================
  CREATE PAGE TYPE
  =========================================
  */

  async function handleSubmit(event) {

    event.preventDefault();


    try {

      setSaving(true);

      setError("");


      const response =
        await fetch(
          "/api/page-types",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              ...form,

              order:
                Number(form.order),

            }),

          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {

        throw new Error(
          result.message ||
          "Failed to create page type"
        );

      }


      router.push(
        "/admin/page-types"
      );

      router.refresh();


    } catch (error) {

      console.error(error);


      setError(
        error.message ||
        "Failed to create page type"
      );


    } finally {

      setSaving(false);

    }

  }


  /*
  =========================================
  PAGE
  =========================================
  */

  return (

    <div className="max-w-3xl p-4 md:p-6">


      {/* =========================================
          TITLE
      ========================================= */}

      <h1 className="mb-6 text-3xl font-bold">

        Create Page Type

      </h1>


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (

        <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">

          {error}

        </div>

      )}


      {/* =========================================
          FORM
      ========================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >


        {/* =========================================
            NAME
        ========================================= */}

        <div>

          <label className="mb-2 block font-medium">

            Name

          </label>


          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Example: Adventure"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-500"
          />

        </div>


        {/* =========================================
            SLUG
        ========================================= */}

        <div>

          <label className="mb-2 block font-medium">

            Slug

          </label>


          <div className="flex gap-2">


            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              placeholder="adventure"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-gray-500"
            />


            <button
              type="button"
              onClick={generateSlug}
              className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              Generate
            </button>


          </div>

        </div>


        {/* =========================================
            DESCRIPTION
        ========================================= */}

        <div>

          <label className="mb-2 block font-medium">

            Description

          </label>


          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-500"
          />

        </div>


        {/* =========================================
            IMAGE URL
        ========================================= */}

        <div>

          <label className="mb-2 block font-medium">

            Image URL

          </label>


          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-500"
          />

        </div>


        {/* =========================================
            ORDER
        ========================================= */}

        <div>

          <label className="mb-2 block font-medium">

            Order

          </label>


          <input
            type="number"
            name="order"
            value={form.order}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-gray-500"
          />

        </div>


        {/* =========================================
            BOOKABLE
        ========================================= */}

        <div className="rounded-lg border bg-gray-50 p-4">

          <label className="flex cursor-pointer items-start gap-3">


            <input
              type="checkbox"
              name="bookable"
              checked={form.bookable}
              onChange={handleChange}
              className="mt-1 h-5 w-5"
            />


            <div>

              <span className="block font-medium">

                Bookable

              </span>


              <span className="mt-1 block text-sm text-gray-500">

                Allow customers to book pages using this Page Type.

              </span>

            </div>


          </label>

        </div>


        {/* =========================================
            PUBLISHED
        ========================================= */}

        <label className="flex cursor-pointer items-center gap-3">


          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
            className="h-5 w-5"
          />


          <span>

            Published

          </span>


        </label>


        {/* =========================================
            BUTTONS
        ========================================= */}

        <div className="flex gap-3 pt-3">


          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
          >

            {saving
              ? "Creating..."
              : "Create Page Type"}

          </button>


          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/page-types"
              )
            }
            className="rounded-lg bg-gray-100 px-6 py-3 hover:bg-gray-200"
          >

            Cancel

          </button>


        </div>


      </form>

    </div>

  );

}

