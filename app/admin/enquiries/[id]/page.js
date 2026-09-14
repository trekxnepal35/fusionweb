
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EnquiryDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /*
  ========================================
  FETCH ENQUIRY
  ========================================
  */

  async function fetchEnquiry() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/enquiries/${id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch enquiry"
        );
      }

      setEnquiry(data.data);
    } catch (error) {
      console.error(
        "Fetch enquiry error:",
        error
      );

      alert(
        error.message ||
          "Failed to fetch enquiry"
      );

      router.push("/admin/enquiries");
    } finally {
      setLoading(false);
    }
  }

  /*
  ========================================
  LOAD ENQUIRY
  ========================================
  */

  useEffect(() => {
    if (id) {
      fetchEnquiry();
    }
  }, [id]);

  /*
  ========================================
  UPDATE STATUS
  ========================================
  */

  async function updateStatus(status) {
    try {
      setUpdating(true);

      const response = await fetch(
        `/api/enquiries/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      setEnquiry(data.data);
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      alert(
        error.message ||
          "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  }

  /*
  ========================================
  DELETE ENQUIRY
  ========================================
  */

  async function deleteEnquiry() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this enquiry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/enquiries/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete enquiry"
        );
      }

      router.push("/admin/enquiries");
    } catch (error) {
      console.error(
        "Delete enquiry error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete enquiry"
      );

      setDeleting(false);
    }
  }

  /*
  ========================================
  FORMAT DATE
  ========================================
  */

  function formatDate(date) {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  /*
  ========================================
  FORMAT DATE + TIME
  ========================================
  */

  function formatDateTime(date) {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  /*
  ========================================
  EXPERIENCE TITLE
  ========================================
  */

  function getExperienceTitle() {
    return (
      enquiry?.experience?.title ||
      enquiry?.experienceTitle ||
      "Unknown Experience"
    );
  }

  /*
  ========================================
  EXPERIENCE TYPE
  ========================================
  */

  function getExperienceType() {
    return (
      enquiry?.experience?.pageType?.name ||
      enquiry?.experience?.pageType?.slug ||
      enquiry?.experienceType ||
      "Unknown"
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
        <p className="text-gray-500">
          Loading enquiry...
        </p>
      </div>
    );
  }

  /*
  ========================================
  NOT FOUND
  ========================================
  */

  if (!enquiry) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          Enquiry not found
        </h2>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/enquiries"
            )
          }
          className="mt-5 rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-700"
        >
          Back to Enquiries
        </button>
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

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/enquiries"
              )
            }
            className="mb-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            ← Back to Enquiries
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Enquiry Details
          </h1>

          <p className="mt-2 text-gray-600">
            {getExperienceTitle()}
          </p>

        </div>


        {/* STATUS */}

        <div className="flex items-center gap-3">

          <select
            value={
              enquiry.status || "new"
            }
            disabled={updating}
            onChange={(event) =>
              updateStatus(
                event.target.value
              )
            }
            className={`rounded-lg border px-5 py-3 font-semibold capitalize outline-none ${getStatusStyle(
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

          {updating && (
            <span className="text-sm text-gray-500">
              Updating...
            </span>
          )}

        </div>

      </div>


      {/* =================================
          CUSTOMER INFORMATION
      ================================= */}

      <section className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-xl font-bold text-gray-900">
            Customer Information
          </h2>

        </div>


        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">

          <DetailItem
            label="Name"
            value={enquiry.name}
          />

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <a
              href={`mailto:${enquiry.email}`}
              className="mt-1 block break-all font-semibold text-blue-600 hover:underline"
            >
              {enquiry.email}
            </a>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <a
              href={`tel:${enquiry.phone}`}
              className="mt-1 block font-semibold text-blue-600 hover:underline"
            >
              {enquiry.phone}
            </a>
          </div>


          <DetailItem
            label="Country"
            value={
              enquiry.country ||
              "Not specified"
            }
          />

        </div>

      </section>


      {/* =================================
          EXPERIENCE INFORMATION
      ================================= */}

      <section className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-xl font-bold text-gray-900">
            Experience Information
          </h2>

        </div>


        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">

          <DetailItem
            label="Experience"
            value={getExperienceTitle()}
          />

          <DetailItem
            label="Page Type"
            value={getExperienceType()}
          />

          <DetailItem
            label="Number of People"
            value={String(
              enquiry.numberOfPeople
            )}
          />

          <DetailItem
            label="Preferred Date"
            value={formatDate(
              enquiry.preferredDate
            )}
          />

        </div>

      </section>


      {/* =================================
          CUSTOMER MESSAGE
      ================================= */}

      <section className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-xl font-bold text-gray-900">
            Customer Message
          </h2>

        </div>


        <div className="p-6">

          {enquiry.message ? (

            <div className="rounded-xl bg-gray-50 p-6">

              <p className="whitespace-pre-line leading-8 text-gray-700">
                {enquiry.message}
              </p>

            </div>

          ) : (

            <p className="text-gray-500">
              No message was provided.
            </p>

          )}

        </div>

      </section>


      {/* =================================
          SUBMISSION INFORMATION
      ================================= */}

      <section className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-xl font-bold text-gray-900">
            Submission Information
          </h2>

        </div>


        <div className="grid gap-6 p-6 sm:grid-cols-2">

          <DetailItem
            label="Submitted"
            value={formatDateTime(
              enquiry.createdAt
            )}
          />

          <DetailItem
            label="Last Updated"
            value={formatDateTime(
              enquiry.updatedAt
            )}
          />

        </div>

      </section>


      {/* =================================
          ACTIONS
      ================================= */}

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">

        <a
          href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
            `Regarding your enquiry for ${getExperienceTitle()}`
          )}`}
          className="rounded-lg bg-gray-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-gray-700"
        >
          Reply by Email
        </a>


        <button
          type="button"
          disabled={deleting}
          onClick={deleteEnquiry}
          className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting
            ? "Deleting..."
            : "Delete Enquiry"}
        </button>

      </div>

    </div>
  );
}


/*
=========================================
DETAIL ITEM
=========================================
*/

function DetailItem({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}

