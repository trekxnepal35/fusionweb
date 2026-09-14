"use client";
export const dynamic = "force-dynamic";

import {
  useEffect,
  useMemo,
  useState,
  Suspense
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";


export default function BookingPage() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();


  /*
  =========================================
  URL PARAMETERS
  =========================================
  */

  const experienceId =
    searchParams.get(
      "experienceId"
    );

  const experienceType =
    searchParams.get(
      "experienceType"
    );


  /*
  =========================================
  STATE
  =========================================
  */

  const [experience, setExperience] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [bookingResult, setBookingResult] =
    useState(null);


  /*
  =========================================
  FORM DATA
  =========================================
  */

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      country: "",
      numberOfPeople: 1,
      preferredDate: "",
      message: "",
    });


  /*
  =========================================
  LOAD EXPERIENCE
  =========================================
  */

  useEffect(() => {
    async function loadExperience() {
      try {
        setLoading(true);
        setError("");

        if (!experienceId) {
          throw new Error(
            "Experience information is missing."
          );
        }


        const response =
          await fetch(
            `/api/pages?id=${encodeURIComponent(
              experienceId
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );


        const result =
          await response.json();


        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Failed to load experience."
          );
        }


        const page =
          result.data;


        /*
        =====================================
        VERIFY EXPERIENCE TYPE
        =====================================
        */

        const actualType =
          typeof page.pageType ===
          "object"
            ? page.pageType?.slug
            : page.pageType;


        /*
        If a type was provided in the URL,
        make sure it matches the Page.
        */

        if (
          experienceType &&
          actualType &&
          actualType
            .toLowerCase() !==
            experienceType.toLowerCase()
        ) {
          throw new Error(
            "Experience type does not match the selected experience."
          );
        }


        /*
        =====================================
        SET EXPERIENCE
        =====================================
        */

        setExperience(page);

      } catch (error) {
        console.error(
          "LOAD EXPERIENCE ERROR:",
          error
        );

        setError(
          error.message ||
            "Failed to load experience."
        );

      } finally {
        setLoading(false);
      }
    }


    loadExperience();

  }, [
    experienceId,
    experienceType,
  ]);


  /*
  =========================================
  PRICE INFORMATION
  =========================================
  */

  const price =
    experience?.price || {};


  const pricingType =
    price.pricingType ||
    "fixed";


  const currency =
    price.currency ||
    "USD";


  const paxPrices =
    Array.isArray(
      price.paxPrices
    )
      ? price.paxPrices
      : [];


  /*
  =========================================
  FIND PAX PRICE
  =========================================
  */

  const getPaxPrice =
    (
      tiers,
      people
    ) => {
      if (
        !Array.isArray(tiers)
      ) {
        return null;
      }


      return (
        tiers.find(
          (tier) => {
            const min =
              Number(
                tier.minPax
              );


            const max =
              tier.maxPax ===
                null ||
              tier.maxPax ===
                "" ||
              typeof tier.maxPax ===
                "undefined"
                ? null
                : Number(
                    tier.maxPax
                  );


            if (
              !Number.isFinite(
                min
              )
            ) {
              return false;
            }


            if (
              people < min
            ) {
              return false;
            }


            if (
              max !== null &&
              Number.isFinite(
                max
              ) &&
              people > max
            ) {
              return false;
            }


            return true;
          }
        ) || null
      );
    };


  /*
  =========================================
  SELECTED PAX TIER
  =========================================
  */

  const selectedTier =
    useMemo(() => {
      if (
        pricingType !==
        "pax_based"
      ) {
        return null;
      }


      return getPaxPrice(
        paxPrices,
        Number(
          formData.numberOfPeople
        )
      );

    }, [
      pricingType,
      paxPrices,
      formData.numberOfPeople,
    ]);


  /*
  =========================================
  CURRENT PRICE PER PERSON
  =========================================
  */

  const pricePerPerson =
    pricingType ===
    "pax_based"
      ? Number(
          selectedTier?.pricePerPax ||
            0
        )
      : Number(
          price.amount || 0
        );


  /*
  =========================================
  ESTIMATED TOTAL
  =========================================
  */

  const estimatedTotal =
    pricePerPerson *
    Number(
      formData.numberOfPeople || 0
    );


  /*
  =========================================
  HANDLE INPUT
  =========================================
  */

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          name ===
          "numberOfPeople"
            ? value
            : value,
      })
    );
  }


  /*
  =========================================
  HANDLE SUBMIT
  =========================================
  */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    try {
      setSubmitting(true);
      setError("");
      setSuccess(false);


      /*
      =====================================
      BASIC VALIDATION
      =====================================
      */

      if (!experienceId) {
        throw new Error(
          "Experience information is missing."
        );
      }


      if (
        !experience
      ) {
        throw new Error(
          "Experience could not be loaded."
        );
      }


      if (
        !formData.name.trim()
      ) {
        throw new Error(
          "Please enter your name."
        );
      }


      if (
        !formData.email.trim()
      ) {
        throw new Error(
          "Please enter your email."
        );
      }


      if (
        !formData.phone.trim()
      ) {
        throw new Error(
          "Please enter your phone number."
        );
      }


      const people =
        Number(
          formData.numberOfPeople
        );


      if (
        !Number.isInteger(
          people
        ) ||
        people < 1
      ) {
        throw new Error(
          "Number of people must be at least 1."
        );
      }


      /*
      =====================================
      PAX PRICE VALIDATION
      =====================================
      */

      if (
        pricingType ===
        "pax_based"
      ) {
        if (
          !selectedTier
        ) {
          throw new Error(
            `No pricing tier is available for ${people} ${
              people === 1
                ? "person"
                : "people"
            }.`
          );
        }
      }


      /*
      =====================================
      SEND BOOKING
      =====================================

      IMPORTANT:

      We intentionally DO NOT send:

      packagePrice
      estimatedTotal
      pricePerPerson

      The server calculates those values
      from MongoDB.
      =====================================
      */

      const response =
        await fetch(
          "/api/bookings",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              experienceId,

              experienceType:
                actualExperienceType,

              name:
                formData.name.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              phone:
                formData.phone.trim(),

              country:
                formData.country.trim(),

              numberOfPeople:
                people,

              preferredDate:
                formData.preferredDate,

              message:
                formData.message.trim(),
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
            "Failed to submit booking."
        );
      }


      /*
      =====================================
      SUCCESS
      =====================================
      */

      setSuccess(true);

      setBookingResult(
        result.data
      );


      /*
      Clear customer fields.
      */

      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "",
        numberOfPeople: 1,
        preferredDate: "",
        message: "",
      });

    } catch (error) {
      console.error(
        "BOOKING SUBMIT ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to submit booking."
      );

    } finally {
      setSubmitting(false);
    }
  }


  /*
  =========================================
  ACTUAL EXPERIENCE TYPE
  =========================================
  */

  const actualExperienceType =
    typeof experience?.pageType ===
    "object"
      ? experience?.pageType?.slug
      : experience?.pageType ||
        experienceType ||
        "";


  /*
  =========================================
  TYPE DISPLAY NAME
  =========================================
  */

  const experienceTypeName =
    typeof experience?.pageType ===
    "object"
      ? experience?.pageType?.name
      : actualExperienceType;


  /*
  =========================================
  LOADING
  =========================================
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <p className="text-gray-600">
              Loading booking information...
            </p>
          </div>
        </div>
      </main>
    );
  }


  /*
  =========================================
  ERROR
  =========================================
  */

  if (
    error &&
    !experience
  ) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <h1 className="mb-3 text-2xl font-bold text-red-700">
              Booking Error
            </h1>

            <p className="text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="mt-6 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
            >
              Go Back
            </button>

          </div>

        </div>
      </main>
    );
  }


  /*
  =========================================
  SUCCESS SCREEN
  =========================================
  */

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✓
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Booking Submitted Successfully
            </h1>

            <p className="mt-3 text-gray-600">
              Thank you for your booking.
              We will contact you shortly.
            </p>


            {bookingResult && (
              <div className="mt-8 rounded-xl bg-gray-50 p-6 text-left">

                <h2 className="mb-4 text-lg font-semibold">
                  Booking Summary
                </h2>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Experience
                    </span>

                    <span className="font-medium text-right">
                      {
                        bookingResult.experienceTitle
                      }
                    </span>
                  </div>


                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Type
                    </span>

                    <span className="font-medium">
                      {
                        bookingResult.experienceType
                      }
                    </span>
                  </div>


                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      People
                    </span>

                    <span className="font-medium">
                      {
                        bookingResult.numberOfPeople
                      }
                    </span>
                  </div>


                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Price / Person
                    </span>

                    <span className="font-medium">
                      {
                        bookingResult.packageCurrency
                      }{" "}
                      {
                        bookingResult.packagePrice
                      }
                    </span>
                  </div>


                  <div className="border-t pt-3">

                    <div className="flex justify-between gap-4">

                      <span className="font-semibold">
                        Estimated Total
                      </span>

                      <span className="text-lg font-bold">
                        {
                          bookingResult.packageCurrency
                        }{" "}
                        {
                          bookingResult.estimatedTotal
                        }
                      </span>

                    </div>

                  </div>

                </div>

              </div>
            )}


            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="mt-8 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
              Back to Website
            </button>

          </div>

        </div>

      </main>
    );
  }


  /*
  =========================================
  BOOKING PAGE
  =========================================
  */

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">

        {/* =================================
            PAGE HEADER
        ================================= */}

        <div className="mb-8">

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {experienceTypeName}
          </p>

          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Book Your Experience
          </h1>

          <p className="mt-2 text-gray-600">
            Complete the form below to send
            your booking request.
          </p>

        </div>


        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}


        <div className="grid gap-8 lg:grid-cols-3">

          {/* =================================
              LEFT / FORM
          ================================= */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-8">

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-6"
              >

                {/* =========================
                    CUSTOMER INFORMATION
                ========================= */}

                <div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    Customer Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Please provide your contact
                    information.
                  </p>

                </div>


                <div className="grid gap-5 md:grid-cols-2">

                  {/* NAME */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Your full name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>


                  {/* EMAIL */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>


                  {/* PHONE */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="+977 98XXXXXXXX"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>


                  {/* COUNTRY */}

                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>

                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={
                        formData.country
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Your country"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>

                </div>


                {/* =========================
                    BOOKING INFORMATION
                ========================= */}

                <div className="border-t pt-6">

                  <h2 className="text-xl font-semibold text-gray-900">
                    Booking Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select the number of people
                    and preferred date.
                  </p>

                </div>


                <div className="grid gap-5 md:grid-cols-2">

                  {/* PEOPLE */}

                  <div>
                    <label
                      htmlFor="numberOfPeople"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Number of People *
                    </label>

                    <input
                      id="numberOfPeople"
                      name="numberOfPeople"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formData.numberOfPeople
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />

                    {pricingType ===
                      "pax_based" && (
                      <p className="mt-2 text-xs text-gray-500">
                        Price will automatically
                        change according to the
                        selected number of people.
                      </p>
                    )}
                  </div>


                  {/* DATE */}

                  <div>
                    <label
                      htmlFor="preferredDate"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Preferred Date
                    </label>

                    <input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={
                        formData.preferredDate
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>

                </div>


                {/* =========================
                    MESSAGE
                ========================= */}

                <div>

                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={
                      formData.message
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tell us anything important about your booking..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />

                </div>


                {/* =========================
                    SUBMIT
                ========================= */}

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting Booking..."
                    : "Submit Booking"}
                </button>

              </form>

            </div>

          </div>


          {/* =================================
              RIGHT / SUMMARY
          ================================= */}

          <aside className="lg:col-span-1">

            <div className="sticky top-6 overflow-hidden rounded-2xl border bg-white shadow-sm">

              {/* IMAGE */}

              {experience.imageUrl && (
                <img
                  src={
                    experience.imageUrl
                  }
                  alt={
                    experience.title
                  }
                  className="h-56 w-full object-cover"
                />
              )}


              <div className="p-5 md:p-6">

                {/* TYPE */}

                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {experienceTypeName}
                </p>


                {/* TITLE */}

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {
                    experience.title
                  }
                </h2>


                {/* DESCRIPTION */}

                {experience.description && (
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600">
                    {
                      experience.description
                    }
                  </p>
                )}


                {/* PRICE */}

                <div className="mt-6 border-t pt-5">

                  <p className="text-sm text-gray-500">
                    Price per person
                  </p>

                  {pricePerPerson >
                  0 ? (
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {currency}{" "}
                      {
                        pricePerPerson
                      }
                    </p>
                  ) : (
                    <p className="mt-1 font-semibold text-red-600">
                      Price unavailable
                    </p>
                  )}

                </div>


                {/* PAX TIER */}

                {pricingType ===
                  "pax_based" && (
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">

                    <h3 className="mb-3 font-semibold text-gray-900">
                      Group Pricing
                    </h3>

                    <div className="space-y-2">

                      {paxPrices.map(
                        (
                          tier,
                          index
                        ) => {

                          const min =
                            Number(
                              tier.minPax
                            );

                          const max =
                            tier.maxPax ===
                              null ||
                            tier.maxPax ===
                              "" ||
                            typeof tier.maxPax ===
                              "undefined"
                              ? null
                              : Number(
                                  tier.maxPax
                                );

                          const label =
                            max ===
                              null
                              ? `${min}+ people`
                              : min ===
                                max
                              ? `${min} people`
                              : `${min}-${max} people`;

                          const active =
                            selectedTier ===
                            tier;

                          return (
                            <div
                              key={
                                tier._id ||
                                index
                              }
                              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                                active
                                  ? "bg-black text-white"
                                  : "bg-white text-gray-700"
                              }`}
                            >

                              <span>
                                {label}
                              </span>

                              <span className="font-semibold">
                                {
                                  currency
                                }{" "}
                                {
                                  tier.pricePerPax
                                }
                              </span>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                )}


                {/* TOTAL */}

                <div className="mt-6 border-t pt-5">

                  <div className="flex items-center justify-between">

                    <span className="font-medium text-gray-600">
                      Estimated Total
                    </span>

                    <span className="text-2xl font-bold text-gray-900">
                      {currency}{" "}
                      {estimatedTotal}
                    </span>

                  </div>

                </div>


                {/* NOTE */}

                <p className="mt-5 text-xs leading-5 text-gray-500">
                  Final pricing will be confirmed
                  by our team. The displayed total
                  is calculated from the current
                  experience pricing.
                </p>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}