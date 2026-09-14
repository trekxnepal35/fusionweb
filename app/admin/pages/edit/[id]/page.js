"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PageForm from "../../PageForm";

export default function EditPageAdminPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
  =========================================
  LOAD PAGE
  =========================================
  */

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/pages/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load page"
          );
        }

        setPage(result.data);
      } catch (error) {
        console.error("LOAD PAGE ERROR:", error);

        setError(
          error.message || "Failed to load page"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPage();
    }
  }, [id]);

  /*
  =========================================
  UPDATE PAGE
  =========================================
  */

  async function handleSubmit(formData) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/pages/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update page"
        );
      }

      /*
      =========================================
      SUCCESS
      =========================================
      */

      router.push("/admin/pages");
      router.refresh();
    } catch (error) {
      console.error("UPDATE PAGE ERROR:", error);

      setError(
        error.message || "Failed to update page"
      );

      /*
      Send error back to PageForm if it supports
      displaying submit errors.
      */

      throw error;
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================
  LOADING
  =========================================
  */

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white border rounded-xl p-8 text-center text-gray-600">
          Loading page...
        </div>
      </div>
    );
  }

  /*
  =========================================
  ERROR LOADING PAGE
  =========================================
  */

  if (error && !page) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-5">
          {error}
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="mt-4 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800"
        >
          Back to Pages
        </button>
      </div>
    );
  }

  /*
  =========================================
  PAGE NOT FOUND
  =========================================
  */

  if (!page) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 text-yellow-700 rounded-lg p-5">
          Page not found.
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="mt-4 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800"
        >
          Back to Pages
        </button>
      </div>
    );
  }

  /*
  =========================================
  FORM
  =========================================
  */

  return (
    <div className="p-4 md:p-6">
      {error && (
        <div className="mb-5 bg-red-100 text-red-700 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      <PageForm
        initialData={page}
        mode="edit"
        pageId={id}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}