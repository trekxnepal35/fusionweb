"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateRegionPage() {

  const router = useRouter();


  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    published: true,
    order: 0,
  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  function handleChange(event) {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setFormData((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

  }


  function generateSlug(value) {

    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  }


  function handleNameChange(event) {

    const value = event.target.value;


    setFormData((current) => ({
      ...current,

      name: value,

      slug:
        current.slug === "" ||
        current.slug ===
          generateSlug(current.name)
          ? generateSlug(value)
          : current.slug,
    }));

  }


  async function handleSubmit(event) {

    event.preventDefault();


    try {

      setLoading(true);
      setError("");


      if (!formData.name.trim()) {

        setError(
          "Region name is required."
        );

        return;

      }


      const response = await fetch(
        "/api/regions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),

            slug:
              formData.slug.trim() ||
              generateSlug(formData.name),

            description:
              formData.description.trim(),

            imageUrl:
              formData.imageUrl.trim(),

            published:
              formData.published,

            order:
              Number(formData.order) || 0,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to create region"
        );

      }


      router.push("/admin/regions");

      router.refresh();

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Failed to create region"
      );

    } finally {

      setLoading(false);

    }

  }


  return (
    <div className="max-w-3xl mx-auto">


      {/* Header */}

      <div className="mb-6">

        <Link
          href="/admin/regions"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Regions
        </Link>


        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
          Create Region
        </h1>

        <p className="text-gray-500 mt-1">
          Add a new trekking region.
        </p>

      </div>


      {/* Error */}

      {error && (

        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>

      )}


      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-8 space-y-6"
      >


        {/* Name */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region Name *
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Annapurna Region"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>


        {/* Slug */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>

          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="annapurna-region"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="text-xs text-gray-500 mt-2">
            Example: annapurna-region
          </p>

        </div>


        {/* Description */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe this trekking region..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />

        </div>


        {/* Image URL */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>

          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://res.cloudinary.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="text-xs text-gray-500 mt-2">
            You can use your Cloudinary image URL here.
          </p>

        </div>


        {/* Image Preview */}

        {formData.imageUrl && (

          <div>

            <p className="text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </p>

            <img
              src={formData.imageUrl}
              alt="Region preview"
              className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

          </div>

        )}


        {/* Order */}

        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>

          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="text-xs text-gray-500 mt-2">
            Lower numbers appear first.
          </p>

        </div>


        {/* Published */}

        <div className="flex items-center gap-3">

          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            id="published"
            className="w-5 h-5"
          />

          <label
            htmlFor="published"
            className="text-sm text-gray-700"
          >
            Publish this region
          </label>

        </div>


        {/* Buttons */}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">

          <Link
            href="/admin/regions"
            className="px-5 py-3 text-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>


          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Region"}
          </button>

        </div>

      </form>

    </div>
  );
}