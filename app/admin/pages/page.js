"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function AdminPagesPage() {

  const [pages, setPages] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [search, setSearch] =
    useState("");


  /*
  =========================================
  LOAD PAGES
  =========================================
  */

  async function loadPages() {

    try {

      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/pages",
          {
            cache: "no-store",
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
          "Failed to load pages"
        );
      }


      setPages(
        result.data || []
      );

    } catch (error) {

      console.error(
        "LOAD PAGES ERROR:",
        error
      );

      setError(
        error.message ||
        "Failed to load pages"
      );

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {
    loadPages();
  }, []);


  /*
  =========================================
  DELETE PAGE
  =========================================
  */

  async function handleDelete(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this page?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(id);


      const response =
        await fetch(
          `/api/pages/${id}`,
          {
            method: "DELETE",
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
          "Failed to delete page"
        );
      }


      setPages(
        (current) =>
          current.filter(
            (page) =>
              page._id !== id
          )
      );

    } catch (error) {

      console.error(
        "DELETE PAGE ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to delete page"
      );

    } finally {

      setDeletingId(null);
    }
  }


  /*
  =========================================
  FILTER
  =========================================
  */

  const filteredPages =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {
        return pages;
      }


      return pages.filter(
        (page) => {

          const title =
            page.title
              ?.toLowerCase() || "";

          const slug =
            page.slug
              ?.toLowerCase() || "";

          const pageType =
            page.pageType?.name
              ?.toLowerCase() || "";

          const region =
            page.region?.name
              ?.toLowerCase() || "";


          return (
            title.includes(query) ||
            slug.includes(query) ||
            pageType.includes(query) ||
            region.includes(query)
          );
        }
      );

    }, [pages, search]);


  /*
  =========================================
  PRICE DISPLAY
  =========================================
  */

  function getPrice(page) {

    const price =
      page.price;


    if (!price) {
      return "No price";
    }


    const currency =
      price.currency || "USD";


    if (
      price.pricingType ===
      "pax_based"
    ) {

      const tiers =
        price.paxPrices || [];


      if (tiers.length === 0) {
        return "PAX pricing";
      }


      return `${currency} / PAX`;
    }


    if (
      price.amount !== undefined &&
      price.amount !== null &&
      price.amount !== ""
    ) {

      return `${currency} ${price.amount}`;
    }


    return "No price";
  }


  return (
    <div className="p-4 md:p-6">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">

        <div>

          <h1 className="text-2xl md:text-3xl font-bold">
            Pages
          </h1>

          <p className="text-gray-600 mt-1">
            Manage all website pages.
          </p>

        </div>


        <Link
          href="/admin/pages/create"
          className="inline-flex justify-center items-center bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          + Create Page
        </Link>

      </div>


      {/* =================================
          SEARCH
      ================================= */}

      <div className="mb-5">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search pages, page types or regions..."
          className="w-full md:max-w-md border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        />

      </div>


      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="mb-5 bg-red-100 text-red-700 border border-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}


      {/* =================================
          LOADING
      ================================= */}

      {loading && (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-600">
          Loading pages...
        </div>
      )}


      {/* =================================
          EMPTY
      ================================= */}

      {!loading &&
        filteredPages.length === 0 && (
          <div className="bg-white border rounded-xl p-8 text-center">

            <h2 className="text-xl font-semibold">
              No Pages Found
            </h2>

            <p className="text-gray-500 mt-2">
              {search
                ? "No pages match your search."
                : "Create your first page."}
            </p>

          </div>
        )}


      {/* =================================
          TABLE
      ================================= */}

      {!loading &&
        filteredPages.length > 0 && (

          <div className="bg-white border rounded-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left p-4">
                      Title
                    </th>

                    <th className="text-left p-4">
                      Page Type
                    </th>

                    <th className="text-left p-4">
                      Region
                    </th>

                    <th className="text-left p-4">
                      Price
                    </th>

                    <th className="text-left p-4">
                      Status
                    </th>

                    <th className="text-right p-4">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredPages.map(
                    (page) => (

                      <tr
                        key={page._id}
                        className="border-t hover:bg-gray-50"
                      >

                        {/* TITLE */}

                        <td className="p-4">

                          <div className="font-semibold">
                            {page.title}
                          </div>

                          <div className="text-sm text-gray-500">
                            /{page.slug}
                          </div>

                        </td>


                        {/* PAGE TYPE */}

                        <td className="p-4">

                          {page.pageType ? (

                            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                              {page.pageType.name}

                            </span>

                          ) : (

                            <span className="text-red-500 text-sm">
                              No Page Type
                            </span>

                          )}

                        </td>


                        {/* REGION */}

                        <td className="p-4">

                          {page.region ? (

                            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                              {page.region.name}

                            </span>

                          ) : (

                            <span className="text-gray-400">
                              No Region
                            </span>

                          )}

                        </td>


                        {/* PRICE */}

                        <td className="p-4">
                          {getPrice(page)}
                        </td>


                        {/* STATUS */}

                        <td className="p-4">

                          {page.published ? (

                            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              Published
                            </span>

                          ) : (

                            <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                              Draft
                            </span>

                          )}

                        </td>


                        {/* ACTIONS */}

                        <td className="p-4">

                          <div className="flex justify-end gap-2">

                            <Link
                              href={`/admin/pages/edit/${page._id}`}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              Edit
                            </Link>


                            <button
                              onClick={() =>
                                handleDelete(
                                  page._id
                                )
                              }
                              disabled={
                                deletingId ===
                                page._id
                              }
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                            >
                              {deletingId ===
                              page._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

    </div>
  );
}