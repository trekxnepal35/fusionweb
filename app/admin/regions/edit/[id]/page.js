"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRegionPage() {

  const params = useParams();
  const router = useRouter();

  const id = params?.id;


  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    published: true,
    order: 0,
  });


  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");


  useEffect(() => {

    if (id) {
      loadRegion();
    }

  }, [id]);


  async function loadRegion() {

    try {

      setLoading(true);
      setError("");


      const response = await fetch(
        `/api/regions/${id}`
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to load region"
        );

      }


      const region = data.data;


      setFormData({
        name: region.name || "",

        slug: region.slug || "",

        description:
          region.description || "",

        imageUrl:
          region.imageUrl || "",

        published:
          region.published !== false,

        order:
          region.order ?? 0,
      });


    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Failed to load region"
      );

    } finally {

      setLoading(false);

    }

  }


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


  async function handleSubmit(event) {

    event.preventDefault();


    try {

      setSaving(true);
      setError("");


      if (!formData.name.trim()) {

        setError(
          "Region name is required."
        );

        return;

      }


      const response = await fetch(
        `/api/regions/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name:
              formData.name.trim(),

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
          "Failed to update region"
        );

      }


      router.push("/admin/regions");

      router.refresh();

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Failed to update region"
      );

    } finally {

      setSaving(false);

    }

  }


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          Loading region...
        </div>

      </div>
    );

  }


  /* =========================
     ERROR
  ========================= */

  if (error && !formData.name) {

    return (
      <div className="max-w-3xl mx-auto">

        <Link
          href="/admin/regions"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Regions
        </Link>


        <div className="mt-6 p-5 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>

      </div>
    );

  }


  return (
    <div className="max-w-3xl mx-auto">


      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6">

        <Link
          href="/admin/regions"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to Regions
        </Link>


        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
          Edit Region
        </h1>

        <p className="text-gray-500 mt-1">
          Update region information.
        </p>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>

      )}


      {/* =========================
          FORM
      ========================= */}

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
            onChange={handleChange}
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

        </div>


        {/* Image */}

        {formData.imageUrl && (

          <div>

            <p className="text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </p>

            <img
              src={formData.imageUrl}
              alt={formData.name}
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
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleChange}
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
            disabled={saving}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}