"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

export default function FeedbackAdminPage() {
  const [feedback, setFeedback] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [deletingId, setDeletingId] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  /*
  ==================================================
  FETCH FEEDBACK
  ==================================================
  */

  async function fetchFeedback() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/feedback?page=1&limit=100",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch feedback."
        );
      }

      setFeedback(result.data || []);
    } catch (error) {
      console.error("Fetch feedback error:", error);

      setError(
        error.message || "Failed to load feedback."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ==================================================
  INITIAL LOAD
  ==================================================
  */

  useEffect(() => {
    fetchFeedback();
  }, []);

  /*
  ==================================================
  UPDATE STATUS
  ==================================================
  */

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(
        `/api/feedback/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update feedback."
        );
      }

      /*
      ==============================================
      UPDATE LOCAL STATE
      ==============================================
      */

      setFeedback((current) =>
        current.map((item) =>
          item._id === id
            ? result.data
            : item
        )
      );
    } catch (error) {
      console.error(
        "Update feedback status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update feedback."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
  ==================================================
  DELETE FEEDBACK
  ==================================================
  */

  async function deleteFeedback(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `/api/feedback/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete feedback."
        );
      }

      /*
      ==============================================
      REMOVE FROM LOCAL STATE
      ==============================================
      */

      setFeedback((current) =>
        current.filter(
          (item) => item._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete feedback error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete feedback."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
  ==================================================
  FILTER FEEDBACK
  ==================================================
  */

  const filteredFeedback = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return feedback.filter((item) => {
      /*
      ==============================================
      STATUS FILTER
      ==============================================
      */

      if (
        statusFilter !== "all" &&
        item.status !== statusFilter
      ) {
        return false;
      }

      /*
      ==============================================
      SEARCH FILTER
      ==============================================
      */

      if (!searchValue) {
        return true;
      }

      const name =
        item.name?.toLowerCase() || "";

      const email =
        item.email?.toLowerCase() || "";

      const comment =
        item.comment?.toLowerCase() || "";

      const pageTitle =
        item.page?.title?.toLowerCase() || "";

      const pageSlug =
        item.page?.slug?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        comment.includes(searchValue) ||
        pageTitle.includes(searchValue) ||
        pageSlug.includes(searchValue)
      );
    });
  }, [
    feedback,
    search,
    statusFilter,
  ]);

  /*
  ==================================================
  STATISTICS
  ==================================================
  */

  const totalCount = feedback.length;

  const pendingCount = feedback.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = feedback.filter(
    (item) => item.status === "approved"
  ).length;

  const rejectedCount = feedback.filter(
    (item) => item.status === "rejected"
  ).length;

  /*
  ==================================================
  RATING DISPLAY
  ==================================================
  */

  function renderRating(rating) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-yellow-500"
                : "text-gray-300"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  /*
  ==================================================
  STATUS BADGE
  ==================================================
  */

  function renderStatus(status) {
    if (status === "approved") {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Pending
      </span>
    );
  }

  /*
  ==================================================
  FORMAT DATE
  ==================================================
  */

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    } catch {
      return "-";
    }
  }

  /*
  ==================================================
  LOADING
  ==================================================
  */

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            Loading feedback...
          </p>
        </div>
      </div>
    );
  }

  /*
  ==================================================
  PAGE
  ==================================================
  */

  return (
    <div className="space-y-6 p-6">
      {/* ==========================================
          HEADER
          ========================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Feedback & Comments
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage customer feedback, comments,
            ratings, and reviews.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          View Website
        </Link>
      </div>

      {/* ==========================================
          ERROR
          ========================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==========================================
          STATISTICS
          ========================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalCount}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <p className="text-sm text-yellow-700">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-800">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm text-green-700">
            Approved
          </p>

          <p className="mt-1 text-2xl font-bold text-green-800">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-red-800">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* ==========================================
          FILTERS
          ========================================== */}

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* SEARCH */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email, comment, page..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All Feedback
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ==========================================
          RESULTS
          ========================================== */}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Feedback
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredFeedback.length} of{" "}
                {feedback.length} feedback entries
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            EMPTY
            ======================================== */}

        {filteredFeedback.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">
              💬
            </div>

            <h3 className="mt-3 font-semibold text-gray-900">
              No feedback found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no feedback entries matching
              your current filters.
            </p>
          </div>
        ) : (
          <>
            {/* ======================================
                DESKTOP TABLE
                ====================================== */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Page
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Rating
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Comment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredFeedback.map(
                    (item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50"
                      >
                        {/* CUSTOMER */}

                        <td className="px-5 py-4 align-top">
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {item.email}
                          </div>
                        </td>

                        {/* PAGE */}

                        <td className="px-5 py-4 align-top">
                          {item.page ? (
                            <>
                              <div className="max-w-[220px] font-medium text-gray-900">
                                {item.page.title}
                              </div>

                              <div className="mt-1 text-xs text-gray-500">
                                /{item.page.slug}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">
                              Page unavailable
                            </span>
                          )}
                        </td>

                        {/* RATING */}

                        <td className="px-5 py-4 align-top">
                          {renderRating(
                            item.rating
                          )}

                          <div className="mt-1 text-xs text-gray-500">
                            {item.rating}/5
                          </div>
                        </td>

                        {/* COMMENT */}

                        <td className="max-w-[300px] px-5 py-4 align-top">
                          <p className="line-clamp-3 text-sm text-gray-700">
                            {item.comment}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4 align-top">
                          {renderStatus(
                            item.status
                          )}
                        </td>

                        {/* DATE */}

                        <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-gray-500">
                          {formatDate(
                            item.createdAt
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            {item.status !==
                              "approved" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  item._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    item._id,
                                    "approved"
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updatingId ===
                                item._id
                                  ? "Saving..."
                                  : "Approve"}
                              </button>
                            )}

                            {item.status !==
                              "rejected" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  item._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    item._id,
                                    "rejected"
                                  )
                                }
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}

                            {item.status !==
                              "pending" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  item._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    item._id,
                                    "pending"
                                  )
                                }
                                className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Pending
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                item._id
                              }
                              onClick={() =>
                                deleteFeedback(
                                  item._id
                                )
                              }
                              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              item._id
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

            {/* ======================================
                MOBILE / TABLET CARDS
                ====================================== */}

            <div className="divide-y divide-gray-200 lg:hidden">
              {filteredFeedback.map(
                (item) => (
                  <div
                    key={item._id}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4">
                      {/* CUSTOMER */}

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.email}
                          </p>
                        </div>

                        {renderStatus(
                          item.status
                        )}
                      </div>

                      {/* PAGE */}

                      {item.page && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Page
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {item.page.title}
                          </p>

                          <p className="text-xs text-gray-500">
                            /{item.page.slug}
                          </p>
                        </div>
                      )}

                      {/* RATING */}

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Rating
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          {renderRating(
                            item.rating
                          )}

                          <span className="text-xs text-gray-500">
                            {item.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* COMMENT */}

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Comment
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-700">
                          {item.comment}
                        </p>
                      </div>

                      {/* DATE */}

                      <p className="text-xs text-gray-500">
                        Submitted{" "}
                        {formatDate(
                          item.createdAt
                        )}
                      </p>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2 border-t pt-4">
                        {item.status !==
                          "approved" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              item._id
                            }
                            onClick={() =>
                              updateStatus(
                                item._id,
                                "approved"
                              )
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {item.status !==
                          "rejected" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              item._id
                            }
                            onClick={() =>
                              updateStatus(
                                item._id,
                                "rejected"
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        {item.status !==
                          "pending" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              item._id
                            }
                            onClick={() =>
                              updateStatus(
                                item._id,
                                "pending"
                              )
                            }
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                          >
                            Pending
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            item._id
                          }
                          onClick={() =>
                            deleteFeedback(
                              item._id
                            )
                          }
                          className="rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                        >
                          {deletingId ===
                          item._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}