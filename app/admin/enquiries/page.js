
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EnquiriesAdminPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /*
  ========================================
  FETCH ENQUIRIES
  ========================================
  */

  async function fetchEnquiries() {
    try {
      setLoading(true);

      const response = await fetch("/api/enquiries", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch enquiries"
        );
      }

      setEnquiries(data.data || []);
    } catch (error) {
      console.error("Fetch enquiries error:", error);
      alert(error.message || "Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================
  LOAD ON PAGE OPEN
  ========================================
  */

  useEffect(() => {
    fetchEnquiries();
  }, []);

  /*
  ========================================
  UPDATE STATUS
  ========================================
  */

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);

      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry._id === id
            ? {
                ...enquiry,
                status,
              }
            : enquiry
        )
      );
    } catch (error) {
      console.error("Update enquiry error:", error);
      alert(error.message || "Failed to update enquiry");
    } finally {
      setUpdatingId(null);
    }
  }

  /*
  ========================================
  DELETE ENQUIRY
  ========================================
  */

  async function deleteEnquiry(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(`/api/enquiries/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete enquiry"
        );
      }

      setEnquiries((current) =>
        current.filter(
          (enquiry) => enquiry._id !== id
        )
      );
    } catch (error) {
      console.error("Delete enquiry error:", error);
      alert(error.message || "Failed to delete enquiry");
    } finally {
      setDeletingId(null);
    }
  }

  /*
  ========================================
  STATUS COUNTS
  ========================================
  */

  const total = enquiries.length;

  const newCount = enquiries.filter(
    (enquiry) => enquiry.status === "new"
  ).length;

  const readCount = enquiries.filter(
    (enquiry) => enquiry.status === "read"
  ).length;

  const repliedCount = enquiries.filter(
    (enquiry) => enquiry.status === "replied"
  ).length;

  const closedCount = enquiries.filter(
    (enquiry) => enquiry.status === "closed"
  ).length;

  /*
  ========================================
  EXPERIENCE TITLE
  ========================================
  */

  function getExperienceTitle(enquiry) {
    return (
      enquiry.experience?.title ||
      enquiry.experienceTitle ||
      "Unknown Experience"
    );
  }

  /*
  ========================================
  EXPERIENCE TYPE
  ========================================
  */

  function getExperienceType(enquiry) {
    return (
      enquiry.experience?.pageType?.name ||
      enquiry.experience?.pageType?.slug ||
      enquiry.experienceType ||
      "Unknown"
    );
  }

  /*
  ========================================
  FORMAT DATE
  ========================================
  */

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  /*
  ========================================
  STATUS STYLE
  ========================================
  */

  function getStatusStyle(status) {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";

      case "read":
        return "bg-yellow-100 text-yellow-700";

      case "replied":
        return "bg-green-100 text-green-700";

      case "closed":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">
          Loading enquiries...
        </div>
      </div>
    );
  }

  /*
  ========================================
  PAGE
  ========================================
  */

  return (
    <div className="space-y-8">

      {/* =================================
          HEADER
      ================================= */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Enquiries
        </h1>

        <p className="mt-2 text-gray-600">
          Manage customer enquiries for your
          treks, tours, and other experiences.
        </p>
      </div>


      {/* =================================
          SUMMARY CARDS
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <SummaryCard
          title="Total"
          value={total}
        />

        <SummaryCard
          title="New"
          value={newCount}
        />

        <SummaryCard
          title="Read"
          value={readCount}
        />

        <SummaryCard
          title="Replied"
          value={repliedCount}
        />

        <SummaryCard
          title="Closed"
          value={closedCount}
        />

      </div>


      {/* =================================
          EMPTY STATE
      ================================= */}

      {enquiries.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">

          <h2 className="text-xl font-semibold text-gray-800">
            No enquiries yet
          </h2>

          <p className="mt-2 text-gray-500">
            Customer enquiries will appear here
            when someone submits the enquiry form.
          </p>

        </div>
      ) : (

        /* =================================
           ENQUIRY LIST
        ================================= */

        <div className="space-y-6">

          {enquiries.map((enquiry) => (

            <div
              key={enquiry._id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >

              {/* ===========================
                  TOP
              =========================== */}

              <div className="flex flex-col gap-4 border-b bg-gray-50 p-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-xl font-bold text-gray-900">
                      {getExperienceTitle(enquiry)}
                    </h2>

                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                      {getExperienceType(enquiry)}
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Submitted{" "}
                    {formatDate(enquiry.createdAt)}
                  </p>

                </div>


                {/* STATUS */}

                <div className="flex items-center gap-3">

                  <select
                    value={enquiry.status || "new"}
                    disabled={updatingId === enquiry._id}
                    onChange={(event) =>
                      updateStatus(
                        enquiry._id,
                        event.target.value
                      )
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize outline-none ${getStatusStyle(
                      enquiry.status
                    )}`}
                  >

                    <option value="new">
                      New
                    </option>

                    <option value="read">
                      Read
                    </option>

                    <option value="replied">
                      Replied
                    </option>

                    <option value="closed">
                      Closed
                    </option>

                  </select>

                  {updatingId === enquiry._id && (
                    <span className="text-xs text-gray-500">
                      Updating...
                    </span>
                  )}

                </div>

              </div>


              {/* ===========================
                  CUSTOMER + ENQUIRY
              =========================== */}

              <div className="grid gap-8 p-6 lg:grid-cols-3">

                {/* CUSTOMER */}

                <div>

                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Customer
                  </h3>

                  <div className="space-y-3">

                    <div>
                      <p className="text-xs text-gray-500">
                        Name
                      </p>

                      <p className="font-semibold text-gray-900">
                        {enquiry.name}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Email
                      </p>

                      <a
                        href={`mailto:${enquiry.email}`}
                        className="break-all text-blue-600 hover:underline"
                      >
                        {enquiry.email}
                      </a>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Phone
                      </p>

                      <a
                        href={`tel:${enquiry.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {enquiry.phone}
                      </a>
                    </div>


                    {enquiry.country && (
                      <div>
                        <p className="text-xs text-gray-500">
                          Country
                        </p>

                        <p className="font-medium text-gray-800">
                          {enquiry.country}
                        </p>
                      </div>
                    )}

                  </div>

                </div>


                {/* TRIP DETAILS */}

                <div>

                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Enquiry Details
                  </h3>

                  <div className="space-y-3">

                    <div>
                      <p className="text-xs text-gray-500">
                        Number of People
                      </p>

                      <p className="font-semibold text-gray-900">
                        {enquiry.numberOfPeople}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Preferred Date
                      </p>

                      <p className="font-semibold text-gray-900">
                        {formatDate(
                          enquiry.preferredDate
                        )}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-gray-500">
                        Experience Type
                      </p>

                      <p className="font-semibold capitalize text-gray-900">
                        {getExperienceType(enquiry)}
                      </p>
                    </div>

                  </div>

                </div>


                {/* EXPERIENCE */}

                <div>

                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Experience
                  </h3>

                  <div className="space-y-3">

                    <div>
                      <p className="text-xs text-gray-500">
                        Title
                      </p>

                      <p className="font-semibold text-gray-900">
                        {getExperienceTitle(enquiry)}
                      </p>
                    </div>


                    {enquiry.experience?.region?.name && (
                      <div>
                        <p className="text-xs text-gray-500">
                          Region
                        </p>

                        <p className="font-medium text-gray-800">
                          {enquiry.experience.region.name}
                        </p>
                      </div>
                    )}

                  </div>

                </div>

              </div>


              {/* ===========================
                  MESSAGE
              =========================== */}

              {enquiry.message && (

                <div className="border-t px-6 py-6">

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
                    Customer Message
                  </h3>

                  <div className="rounded-xl bg-gray-50 p-5">

                    <p className="whitespace-pre-line leading-7 text-gray-700">
                      {enquiry.message}
                    </p>

                  </div>

                </div>

              )}


              {/* ===========================
                  ACTIONS
              =========================== */}

              <div className="flex flex-col gap-3 border-t bg-gray-50 p-6 sm:flex-row sm:justify-end">

                <Link
                  href={`/admin/enquiries/${enquiry._id}`}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                >
                  View Details
                </Link>

                <a
                  href={`mailto:${enquiry.email}`}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 transition hover:bg-gray-100"
                >
                  Reply by Email
                </a>

                <button
                  type="button"
                  disabled={deletingId === enquiry._id}
                  onClick={() =>
                    deleteEnquiry(enquiry._id)
                  }
                  className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === enquiry._id
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}


/*
=========================================
SUMMARY CARD
=========================================
*/

function SummaryCard({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}

