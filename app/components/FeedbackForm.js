"use client";

import { useState } from "react";

export default function FeedbackForm({
  pageId,
  pageTitle = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /*
  ==================================================
  HANDLE INPUT
  ==================================================
  */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  /*
  ==================================================
  SELECT RATING
  ==================================================
  */

  function handleRating(rating) {
    setFormData((current) => ({
      ...current,
      rating,
    }));
  }

  /*
  ==================================================
  SUBMIT FORM
  ==================================================
  */

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    /*
    ==============================================
    PAGE VALIDATION
    ==============================================
    */

    if (!pageId) {
      setError(
        "Unable to submit feedback because the page was not found."
      );

      return;
    }

    /*
    ==============================================
    BASIC VALIDATION
    ==============================================
    */

    if (!formData.name.trim()) {
      setError("Please enter your name.");

      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");

      return;
    }

    if (!formData.comment.trim()) {
      setError("Please enter your comment.");

      return;
    }

    try {
      setLoading(true);

      /*
      ============================================
      SEND FEEDBACK
      ============================================
      */

      const response = await fetch("/api/feedback", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          page: pageId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          rating: Number(formData.rating),
          comment: formData.comment.trim(),
        }),
      });

      const result = await response.json();

      /*
      ============================================
      HANDLE API ERROR
      ============================================
      */

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to submit your feedback."
        );
      }

      /*
      ============================================
      SUCCESS
      ============================================
      */

      setMessage(
        "Thank you for your feedback! Your comment has been submitted and is waiting for approval."
      );

      /*
      ============================================
      RESET FORM
      ============================================
      */

      setFormData({
        name: "",
        email: "",
        rating: 5,
        comment: "",
      });
    } catch (error) {
      console.error(
        "Feedback submission error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while submitting your feedback."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

      {/* ==========================================
          HEADER
          ========================================== */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Leave a Comment
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Share your experience, thoughts, or
          questions
          {pageTitle
            ? ` about ${pageTitle}`
            : ""}
          .
        </p>
      </div>


      {/* ==========================================
          SUCCESS MESSAGE
          ========================================== */}

      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
          {message}
        </div>
      )}


      {/* ==========================================
          ERROR MESSAGE
          ========================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}


      {/* ==========================================
          FORM
          ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* ========================================
            NAME
            ======================================== */}

        <div>
          <label
            htmlFor="feedback-name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Name
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="feedback-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            maxLength={100}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>


        {/* ========================================
            EMAIL
            ======================================== */}

        <div>
          <label
            htmlFor="feedback-email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="feedback-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            maxLength={150}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Your email will not be displayed publicly.
          </p>
        </div>


        {/* ========================================
            RATING
            ======================================== */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Rating
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  handleRating(star)
                }
                aria-label={`${star} star${
                  star > 1 ? "s" : ""
                }`}
                aria-pressed={
                  Number(formData.rating) ===
                  star
                }
                className="rounded p-1 text-3xl leading-none transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <span
                  className={
                    star <=
                    Number(formData.rating)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {formData.rating} out of 5
          </p>
        </div>


        {/* ========================================
            COMMENT
            ======================================== */}

        <div>
          <label
            htmlFor="feedback-comment"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Comment
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <textarea
            id="feedback-comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your experience or leave a comment..."
            rows={6}
            maxLength={2000}
            required
            className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-1 flex justify-end">
            <span className="text-xs text-gray-500">
              {formData.comment.length}/2000
            </span>
          </div>
        </div>


        {/* ========================================
            SUBMIT
            ======================================== */}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : "Submit Comment"}
          </button>
        </div>


        {/* ========================================
            MODERATION NOTE
            ======================================== */}

        <p className="text-xs leading-5 text-gray-500">
          Your comment will be reviewed before it
          appears publicly.
        </p>

      </form>
    </section>
  );
}