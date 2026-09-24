
"use client";

import { useEffect, useState } from "react";

export default function AdminBookingsPage() {

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);


  /*
  ========================================
  LOAD BOOKINGS
  ========================================
  */

  async function loadBookings() {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        "/api/bookings",
        {
          cache: "no-store",
        }
      );


      const result = await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Failed to load bookings."
        );

      }


      setBookings(
        result.data || []
      );


    } catch (err) {

      console.error(
        "LOAD BOOKINGS ERROR:",
        err
      );

      setError(
        err.message ||
        "Failed to load bookings."
      );


    } finally {

      setLoading(false);

    }

  }


  /*
  ========================================
  INITIAL LOAD
  ========================================
  */

  useEffect(() => {

    loadBookings();

  }, []);


  /*
  ========================================
  UPDATE STATUS
  ========================================
  */

  async function updateStatus(
    bookingId,
    status
  ) {

    try {

      setUpdatingId(bookingId);


      const response = await fetch(
        `/api/bookings/${bookingId}`,
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


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Failed to update booking."
        );

      }


      /*
      ========================================
      UPDATE LOCAL BOOKING
      ========================================
      */

      setBookings((previous) =>

        previous.map((booking) =>

          booking._id === bookingId

            ? {
                ...booking,
                status,
              }

            : booking

        )

      );


    } catch (err) {

      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      alert(
        err.message ||
        "Failed to update booking."
      );


    } finally {

      setUpdatingId(null);

    }

  }


  /*
  ========================================
  DELETE BOOKING
  ========================================
  */

  async function deleteBooking(
    bookingId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this booking?"
      );


    if (!confirmed) {

      return;

    }


    try {

      setUpdatingId(bookingId);


      const response = await fetch(
        `/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Failed to delete booking."
        );

      }


      /*
      ========================================
      REMOVE FROM LOCAL STATE
      ========================================
      */

      setBookings((previous) =>

        previous.filter(
          (booking) =>
            booking._id !== bookingId
        )

      );


    } catch (err) {

      console.error(
        "DELETE BOOKING ERROR:",
        err
      );

      alert(
        err.message ||
        "Failed to delete booking."
      );


    } finally {

      setUpdatingId(null);

    }

  }


  /*
  ========================================
  FORMAT PAGE TYPE
  ========================================
  */

  function getExperienceType(booking) {

    /*
    ----------------------------------------
    PAGE TYPE FROM POPULATED EXPERIENCE
    ----------------------------------------
    */

    if (
      booking.experience?.pageType
    ) {

      if (
        typeof booking.experience.pageType ===
        "object"
      ) {

        return (
          booking.experience.pageType.name ||
          booking.experience.pageType.slug ||
          "Experience"
        );

      }

      return booking.experience.pageType;

    }


    /*
    ----------------------------------------
    BOOKING SNAPSHOT FALLBACK
    ----------------------------------------
    */

    if (booking.experienceType) {

      return booking.experienceType;

    }


    return "Experience";

  }


  /*
  ========================================
  EXPERIENCE TITLE
  ========================================
  */

  function getExperienceTitle(
    booking
  ) {

    return (
      booking.experience?.title ||
      booking.experienceTitle ||
      booking.trekTitle ||
      "Experience"
    );

  }


  /*
  ========================================
  FORMAT CURRENCY
  ========================================
  */

  function formatPrice(
    amount,
    currency = "USD"
  ) {

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {

      return "—";

    }


    const numericAmount =
      Number(amount);


    if (
      !Number.isFinite(numericAmount)
    ) {

      return "—";

    }


    return `${currency} ${numericAmount.toLocaleString()}`;

  }


  /*
  ========================================
  STATUS CLASS
  ========================================
  */

  function getStatusClass(
    status
  ) {

    if (
      status === "confirmed"
    ) {

      return "bg-green-100 text-green-700";

    }


    if (
      status === "cancelled"
    ) {

      return "bg-red-100 text-red-700";

    }


    return "bg-yellow-100 text-yellow-700";

  }


  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {

    return (

      <div className="p-6">

        <div className="rounded-xl bg-white p-10 text-center shadow">

          <p className="text-gray-500">
            Loading bookings...
          </p>

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

    <div className="p-4 md:p-6">


      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold md:text-3xl">
            Bookings
          </h1>

          <p className="mt-1 text-gray-500">
            Manage bookings for all experiences.
          </p>

        </div>


        <button
          onClick={loadBookings}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          Refresh
        </button>

      </div>


      {/* ========================================
          ERROR
      ======================================== */}

      {error && (

        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">

          {error}

        </div>

      )}


      {/* ========================================
          SUMMARY
      ======================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


        {/* TOTAL */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Total Bookings
          </p>

          <p className="mt-1 text-3xl font-bold">
            {bookings.length}
          </p>

        </div>


        {/* PENDING */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-1 text-3xl font-bold text-yellow-600">

            {
              bookings.filter(
                (booking) =>
                  booking.status ===
                  "pending"
              ).length
            }

          </p>

        </div>


        {/* CONFIRMED */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Confirmed
          </p>

          <p className="mt-1 text-3xl font-bold text-green-600">

            {
              bookings.filter(
                (booking) =>
                  booking.status ===
                  "confirmed"
              ).length
            }

          </p>

        </div>


        {/* CANCELLED */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">
            Cancelled
          </p>

          <p className="mt-1 text-3xl font-bold text-red-600">

            {
              bookings.filter(
                (booking) =>
                  booking.status ===
                  "cancelled"
              ).length
            }

          </p>

        </div>


      </div>


      {/* ========================================
          NO BOOKINGS
      ======================================== */}

      {bookings.length === 0 ? (

        <div className="rounded-xl bg-white p-10 text-center shadow">

          <h2 className="text-xl font-semibold">
            No bookings yet
          </h2>

          <p className="mt-2 text-gray-500">
            Customer bookings will appear here.
          </p>

        </div>

      ) : (


        /* ========================================
           BOOKINGS LIST
        ======================================== */

        <div className="space-y-4">


          {bookings.map(
            (booking) => {  
             const experienceTitle =
                getExperienceTitle(
                  booking
                );


              const experienceType =
                getExperienceType(
                  booking
                );


              const currency =
                booking.packageCurrency ||
                booking.experience?.price?.currency ||
                "USD";


              return (

                <div
                  key={booking._id}
                  className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
                >
                  


                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">


                    {/* ========================================
                        BOOKING INFORMATION
                    ======================================== */}

                    <div className="min-w-0 flex-1">


                      {/* CUSTOMER NAME */}

                      <h2 className="text-xl font-bold">
                        {booking.name}
                      </h2>


                      {/* EXPERIENCE */}

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        <p className="font-medium text-gray-700">
                          {experienceTitle}
                        </p>


                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

                          {experienceType}

                        </span>

                      </div>


                      {/* CUSTOMER DETAILS */}

                      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gray-600 md:grid-cols-2">


                        <p>

                          <strong>
                            Email:
                          </strong>{" "}

                          {booking.email}

                        </p>


                        <p>

                          <strong>
                            Phone:
                          </strong>{" "}

                          {booking.phone}

                        </p>


                        <p>

                          <strong>
                            Country:
                          </strong>{" "}

                          {booking.country ||
                            "Not provided"}

                        </p>


                        <p>

                          <strong>
                            People:
                          </strong>{" "}

                          {booking.numberOfPeople} 

                        </p>
                        <p>

                          <strong>
                            Terms and Conditions: 
                          </strong>{" "}
                          {booking.acceptTerms && "Accepted"}


                        </p>


                        <p>

                          <strong>
                            Preferred Date:
                          </strong>{" "}

                          {booking.preferredDate ||
                            "Not provided"}

                        </p>


                        <p>

                          <strong>
                            Price / Person:
                          </strong>{" "}

                          {formatPrice(
                            booking.packagePrice,
                            currency
                          )}

                        </p>


                      </div>


                      {/* ESTIMATED TOTAL */}

                      <div className="mt-4 rounded-lg bg-gray-50 p-4">

                        <div className="flex flex-wrap items-center justify-between gap-2">

                          <span className="text-sm font-medium text-gray-600">
                            Estimated Total
                          </span>

                          <span className="text-lg font-bold text-gray-900">

                            {formatPrice(
                              booking.estimatedTotal,
                              currency
                            )}

                          </span>

                        </div>

                      </div>


                      {/* MESSAGE */}

                      {booking.message && (

                        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">

                          <strong>
                            Message:
                          </strong>

                          <p className="mt-1 whitespace-pre-wrap text-gray-600">
                            {booking.message}
                          </p>

                        </div>

                      )}


                    </div>


                    {/* ========================================
                        ACTIONS
                    ======================================== */}

                    <div className="flex flex-col gap-3 lg:min-w-48">


                      {/* STATUS */}

                      <span
                        className={`rounded-full px-3 py-2 text-center text-sm font-semibold capitalize ${getStatusClass(
                          booking.status
                        )}`}
                      >

                        {booking.status}

                      </span>


                      {/* STATUS SELECT */}

                      <select
                        value={
                          booking.status
                        }
                        disabled={
                          updatingId ===
                          booking._id
                        }
                        onChange={(e) =>
                          updateStatus(
                            booking._id,
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-gray-500"
                      >

                        <option value="pending">
                          Pending
                        </option>

                        <option value="confirmed">
                          Confirmed
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>

                      </select>


                      {/* DELETE */}

                      <button
                        onClick={() =>
                          deleteBooking(
                            booking._id
                          )
                        }
                        disabled={
                          updatingId ===
                          booking._id
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {updatingId ===
                        booking._id
                          ? "Processing..."
                          : "Delete"}

                      </button>


                    </div>


                  </div>


                  {/* ========================================
                      FOOTER
                  ======================================== */}

                  <div className="mt-5 flex flex-col gap-1 border-t pt-3 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

                    <span>
                      Booking ID:{" "}
                      {booking._id}
                    </span>

                    {booking.createdAt && (

                      <span>
                        Created:{" "}
                        {new Date(
                          booking.createdAt
                        ).toLocaleString()}
                      </span>

                    )}

                  </div>


                </div>

              );

            }

          )}


        </div>

      )}


    </div>

  );

}

