"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";


export default function EnquiryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const experienceId =
    searchParams.get("experienceId");

  const experienceType =
    searchParams.get("experienceType");

  const [experience, setExperience] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =========================================
  FORM DATA
  =========================================
  */

  const [formData, setFormData] = useState({
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
        if (!experienceId) {
          setError("Experience was not selected.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/pages?id=${experienceId}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to load experience"
          );
        }

        const page = result.data;

        /*
        ======================================
        VERIFY BOOKABLE
        ======================================
        */

        if (page.pageType?.bookable !== true) {
          throw new Error(
            "This experience does not accept enquiries."
          );
        }

        /*
        ======================================
        VERIFY EXPERIENCE TYPE
        ======================================
        */

        if (
          experienceType &&
          page.pageType?.slug !== experienceType
        ) {
          throw new Error(
            "Experience type does not match."
          );
        }

        /*
        ======================================
        VERIFY PUBLISHED
        ======================================
        */

        if (page.published !== true) {
          throw new Error(
            "This experience is not currently available."
          );
        }

        setExperience(page);
      } catch (err) {
        console.error(
          "LOAD EXPERIENCE ERROR:",
          err
        );

        setError(
          err.message ||
            "Failed to load experience."
        );
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, [experienceId, experienceType]);

  /*
  =========================================
  EXPERIENCE TYPE
  =========================================
  */

  const actualExperienceType =
    experience?.pageType?.slug ||
    experienceType ||
    "";

  /*
  =========================================
  EXPERIENCE TYPE NAME
  =========================================
  */

  const experienceTypeName = useMemo(() => {
    if (experience?.pageType?.name) {
      return experience.pageType.name;
    }

    if (!actualExperienceType) {
      return "Experience";
    }

    return actualExperienceType
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }, [
    experience,
    actualExperienceType,
  ]);

  /*
  =========================================
  INPUT CHANGE
  =========================================
  */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /*
  =========================================
  SUBMIT
  =========================================
  */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      if (!experience?._id) {
        throw new Error(
          "Experience information is missing."
        );
      }

      const response = await fetch(
        "/api/enquiries",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            experienceId: experience._id,

            experienceType:
              actualExperienceType,

            name: formData.name,

            email: formData.email,

            phone: formData.phone,

            country: formData.country,

            numberOfPeople:
              Number(formData.numberOfPeople),

            preferredDate:
              formData.preferredDate || null,

            message: formData.message,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to submit enquiry."
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error(
        "SUBMIT ENQUIRY ERROR:",
        err
      );

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
  =========================================
  LOADING
  =========================================
  */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-3xl mb-3">
            ⏳
          </div>

          <p className="text-gray-600">
            Loading enquiry form...
          </p>
        </div>
      </main>
    );
  }

  /*
  =========================================
  ERROR
  =========================================
  */

  if (error && !experience) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Unable to Open Enquiry
          </h1>

          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <Link
            href="/treks"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Browse Experiences
          </Link>
        </div>
      </main>
    );
  }

  /*
  =========================================
  SUCCESS
  =========================================
  */

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-4xl">
                ✓
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Enquiry Sent Successfully!
            </h1>

            <p className="text-gray-600 mb-3">
              Thank you for your enquiry about:
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {experience?.title}
            </h2>

            <p className="text-sm text-gray-500 mb-8">
              Our team will review your enquiry
              and contact you soon.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
              >
                Back to Home
              </Link>

              <Link
                href="/treks"
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
              >
                Browse Experiences
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  =========================================
  MAIN FORM
  =========================================
  */

  return (
    <main className="min-h-screen bg-gray-50 py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ================================
            HEADER
        ================================= */}

        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Make an Enquiry
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Plan Your {experienceTypeName}
          </h1>

          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Send us your requirements and our
            team will get back to you with more
            information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================================
              EXPERIENCE SUMMARY
          ================================= */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-6">

              {experience?.imageUrl ? (
                <img
                  src={experience.imageUrl}
                  alt={experience.title}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">
                    No Image
                  </span>
                </div>
              )}

              <div className="p-6">
                <p className="text-sm text-blue-600 font-semibold mb-2">
                  {experienceTypeName}
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {experience?.title}
                </h2>

                {experience?.description && (
                  <p className="text-gray-600 text-sm leading-6">
                    {experience.description}
                  </p>
                )}

                <div className="border-t border-gray-200 mt-6 pt-5">
                  <p className="text-sm text-gray-500">
                    Selected Experience
                  </p>

                  <p className="font-medium text-gray-900 mt-1">
                    {experience?.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================================
              ENQUIRY FORM
          ================================= */}

          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-md p-6 md:p-8"
            >

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                  {error}
                </div>
              )}

              {/* ============================
                  CUSTOMER INFORMATION
              ============================= */}

              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Your Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+977 98XXXXXXXX"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Your country"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* ============================
                  TRIP INFORMATION
              ============================= */}

              <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6">
                Trip Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of People *
                  </label>

                  <input
                    type="number"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>

                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* ============================
                  MESSAGE
              ============================= */}

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tell us about your requirements, questions, preferred itinerary, group details, or anything else..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ============================
                  SUBMIT
              ============================= */}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white font-semibold px-6 py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Sending Enquiry..."
                    : "Send Enquiry"}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you are
                sending an enquiry to our team.
              </p>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}