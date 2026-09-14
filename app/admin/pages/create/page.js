"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageForm from "../PageForm";

export default function CreatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    console.log("CREATE PAGE handleSubmit CALLED");
    console.log(formData);

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      const result = await response.json();

      console.log("Response result:", result);

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create page"
        );
      }

      alert("Page created successfully");

      router.push("/admin/pages");

    } catch (error) {

      console.error("CREATE PAGE ERROR:", error);

      setError(error.message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Create Page</h1>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <PageForm
        initialData={{}}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}