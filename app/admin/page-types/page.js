
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PageTypesAdminPage() {

  const [pageTypes, setPageTypes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");


  /*
  =========================================
  LOAD PAGE TYPES
  =========================================
  */

  async function loadPageTypes() {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        "/api/page-types",
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
          "Failed to load page types"
        );

      }


      setPageTypes(
        result.data || []
      );


    } catch (error) {

      console.error(error);


      setError(
        error.message ||
        "Failed to load page types"
      );


    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadPageTypes();

  }, []);


  /*
  =========================================
  DELETE
  =========================================
  */

  async function handleDelete(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this page type?"
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingId(id);


      const response =
        await fetch(
          `/api/page-types/${id}`,
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
          "Failed to delete page type"
        );

      }


      setPageTypes(
        (current) =>
          current.filter(
            (item) =>
              item._id !== id
          )
      );


    } catch (error) {

      console.error(error);


      alert(
        error.message ||
        "Failed to delete page type"
      );


    } finally {

      setDeletingId(null);

    }

  }


  /*
  =========================================
  PAGE
  =========================================
  */

  return (

    <div className="p-4 md:p-6">


      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">


        <div>

          <h1 className="text-2xl font-bold md:text-3xl">
            Page Types
          </h1>


          <p className="mt-1 text-gray-600">
            Manage dynamic page types for your website.
          </p>

        </div>


        <Link
          href="/admin/page-types/create"
          className="rounded-lg bg-black px-5 py-2.5 text-center text-white transition hover:bg-gray-800"
        >
          + Create Page Type
        </Link>


      </div>


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (

        <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">

          {error}

        </div>

      )}


      {/* =========================================
          LOADING
      ========================================= */}

      {loading && (

        <div className="text-gray-600">

          Loading page types...

        </div>

      )}


      {/* =========================================
          EMPTY
      ========================================= */}

      {!loading &&
        pageTypes.length === 0 && (

          <div className="rounded-xl border bg-white p-8 text-center">

            <h2 className="text-xl font-semibold">
              No Page Types Found
            </h2>


            <p className="mt-2 text-gray-500">
              Create your first page type.
            </p>

          </div>

        )}


      {/* =========================================
          TABLE
      ========================================= */}

      {!loading &&
        pageTypes.length > 0 && (

          <div className="overflow-hidden rounded-xl border bg-white">


            <div className="overflow-x-auto">


              <table className="w-full min-w-[900px]">


                <thead className="bg-gray-100">

                  <tr>

                    <th className="p-4 text-left">
                      Name
                    </th>


                    <th className="p-4 text-left">
                      Slug
                    </th>


                    <th className="p-4 text-left">
                      Bookable
                    </th>


                    <th className="p-4 text-left">
                      Order
                    </th>


                    <th className="p-4 text-left">
                      Status
                    </th>


                    <th className="p-4 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>


                  {pageTypes.map(
                    (pageType) => (

                      <tr
                        key={
                          pageType._id
                        }
                        className="border-t"
                      >


                        {/* NAME */}

                        <td className="p-4 font-medium">

                          {pageType.name}

                        </td>


                        {/* SLUG */}

                        <td className="p-4 text-gray-600">

                          {pageType.slug}

                        </td>


                        {/* BOOKABLE */}

                        <td className="p-4">

                          {pageType.bookable ? (

                            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">

                              Bookable

                            </span>

                          ) : (

                            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">

                              Not Bookable

                            </span>

                          )}

                        </td>


                        {/* ORDER */}

                        <td className="p-4">

                          {pageType.order}

                        </td>


                        {/* STATUS */}

                        <td className="p-4">

                          {pageType.published ? (

                            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">

                              Published

                            </span>

                          ) : (

                            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">

                              Hidden

                            </span>

                          )}

                        </td>


                        {/* ACTIONS */}

                        <td className="p-4">

                          <div className="flex justify-end gap-2">


                            <Link
                              href={`/admin/page-types/edit/${pageType._id}`}
                              className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
                            >
                              Edit
                            </Link>


                            <button
                              onClick={() =>
                                handleDelete(
                                  pageType._id
                                )
                              }
                              disabled={
                                deletingId ===
                                pageType._id
                              }
                              className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 disabled:opacity-50"
                            >

                              {deletingId ===
                              pageType._id
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

