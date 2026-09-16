"use client";

import { useEffect, useState } from "react";

export default function FeedbackList({ pageId }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pageId) {
      setLoading(false);
      return;
    }

    async function loadFeedback() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/feedback?pageId=${encodeURIComponent(pageId)}&page=1&limit=20`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load feedback."
          );
        }

        setFeedback(result.data || []);
      } catch (error) {
        console.error("Feedback loading error:", error);

        setError(
          error.message || "Unable to load feedback."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, [pageId]);

  function renderStars(rating) {
    return (
      <div
        className="flex items-center gap-1"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={
              index < rating
                ? "text-yellow-400"
                : "text-gray-300"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  if (!pageId) {
    return null;
  }

  return (
    <section className="mt-10">
      {/* =========================================
          SECTION HEADER
      ========================================= */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Comments & Reviews
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          See what other visitors have to say.
        </p>
      </div>

      {/* =========================================
          LOADING
      ========================================= */}

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

          <p className="text-sm text-gray-500">
            Loading comments...
          </p>
        </div>
      )}

      {/* =========================================
          ERROR
      ========================================= */}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =========================================
          EMPTY STATE
      ========================================= */}

      {!loading &&
        !error &&
        feedback.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-600">
              No comments yet.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Be the first to share your experience.
            </p>
          </div>
        )}

      {/* =========================================
          FEEDBACK LIST
      ========================================= */}

      {!loading &&
        !error &&
        feedback.length > 0 && (
          <div className="space-y-5">
            {feedback.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* USER INFORMATION */}

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* RATING */}

                  <div className="flex items-center gap-2">
                    {renderStars(item.rating)}

                    <span className="text-sm font-medium text-gray-600">
                      {item.rating}/5
                    </span>
                  </div>
                </div>

                {/* COMMENT */}

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                    {item.comment}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
    </section>
  );
}