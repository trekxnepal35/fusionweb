"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function RegionsPage() {

  const [regions, setRegions] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    loadRegions();
  }, []);


  async function loadRegions() {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/regions"
      );

      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load regions"
        );
      }


      setRegions(data.data || []);

    } catch (error) {

      console.error(error);

      setError(
        error.message || "Unable to load regions"
      );

    } finally {

      setLoading(false);

    }

  }


  const filteredRegions = useMemo(() => {

    const value = search
      .trim()
      .toLowerCase();


    if (!value) {
      return regions;
    }


    return regions.filter((region) =>
      region.name?.toLowerCase().includes(value) ||
      region.slug?.toLowerCase().includes(value)
    );

  }, [regions, search]);


  async function togglePublished(region) {

    try {

      setMessage("");
      setError("");

      const response = await fetch(
        `/api/regions/${region._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            published: !region.published,
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


      setRegions((current) =>
        current.map((item) =>
          item._id === region._id
            ? data.data
            : item
        )
      );


      setMessage(
        `${region.name} ${
          !region.published
            ? "published"
            : "unpublished"
        } successfully.`
      );

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Failed to update region"
      );

    }

  }


  async function deleteRegion(region) {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${region.name}"?`
    );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(region._id);
      setMessage("");
      setError("");


      const response = await fetch(
        `/api/regions/${region._id}`,
        {
          method: "DELETE",
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to delete region"
        );

      }


      setRegions((current) =>
        current.filter(
          (item) =>
            item._id !== region._id
        )
      );


      setMessage(
        `${region.name} deleted successfully.`
      );

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Failed to delete region"
      );

    } finally {

      setDeletingId(null);

    }

  }


  return (
    <div className="max-w-7xl mx-auto">


      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Regions
          </h1>

          <p className="text-gray-500 mt-1">
            Manage trekking regions
          </p>

        </div>


        <Link
          href="/admin/regions/create"
          className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Region
        </Link>

      </div>


      {/* =========================
          ALERTS
      ========================= */}

      {error && (

        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>

      )}


      {message && (

        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {message}
        </div>

      )}


      {/* =========================
          SEARCH
      ========================= */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search region name or slug..."
            className="w-full sm:max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="text-sm text-gray-500">
            {filteredRegions.length} region
            {filteredRegions.length !== 1
              ? "s"
              : ""}
          </div>

        </div>

      </div>


      {/* =========================
          LOADING
      ========================= */}

      {loading ? (

        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          Loading regions...
        </div>

      ) : filteredRegions.length === 0 ? (

        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">

          <p className="text-gray-500 mb-4">
            No regions found.
          </p>

          <Link
            href="/admin/regions/create"
            className="text-blue-600 hover:text-blue-800"
          >
            Create your first region →
          </Link>

        </div>

      ) : (

        /* =========================
           TABLE
        ========================= */

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                    Region
                  </th>

                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                    Slug
                  </th>

                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                    Order
                  </th>

                  <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredRegions.map((region) => (

                  <tr
                    key={region._id}
                    className="hover:bg-gray-50"
                  >

                    {/* Region */}

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        {region.imageUrl ? (

                          <img
                            src={region.imageUrl}
                            alt={region.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />

                        ) : (

                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                            —
                          </div>

                        )}


                        <div>

                          <p className="font-semibold text-gray-900">
                            {region.name}
                          </p>

                          {region.description && (

                            <p className="text-sm text-gray-500 max-w-xs truncate">
                              {region.description}
                            </p>

                          )}

                        </div>

                      </div>

                    </td>


                    {/* Slug */}

                    <td className="px-4 py-4">

                      <code className="text-sm text-gray-600">
                        {region.slug}
                      </code>

                    </td>


                    {/* Order */}

                    <td className="px-4 py-4 text-gray-600">
                      {region.order ?? 0}
                    </td>


                    {/* Status */}

                    <td className="px-4 py-4">

                      <button
                        onClick={() =>
                          togglePublished(region)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          region.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {region.published
                          ? "Published"
                          : "Draft"}
                      </button>

                    </td>


                    {/* Actions */}

                    <td className="px-4 py-4">

                      <div className="flex justify-end gap-2">

                        <Link
                          href={`/admin/regions/edit/${region._id}`}
                          className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          Edit
                        </Link>


                        <button
                          onClick={() =>
                            deleteRegion(region)
                          }
                          disabled={
                            deletingId === region._id
                          }
                          className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === region._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}