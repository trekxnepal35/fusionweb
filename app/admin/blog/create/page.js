"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageForm from "../../pages/PageForm";

export default function CreateBlogPage() {
const router = useRouter();

const [blogPageType, setBlogPageType] = useState(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

/*

# FIND BLOG PAGE TYPE

*/

useEffect(() => {
const fetchBlogPageType = async () => {
try {
setLoading(true);
setError("");


    const response = await fetch("/api/page-types", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to load page types"
      );
    }

    const pageTypes = result.data || [];

    const blogType = pageTypes.find(
      (type) => type.slug === "blog"
    );

    if (!blogType) {
      throw new Error(
        'Blog Page Type was not found. Please create a Page Type with slug "blog" first.'
      );
    }

    setBlogPageType(blogType);
  } catch (error) {
    console.error("Fetch Blog Page Type error:", error);

    setError(
      error.message || "Failed to load Blog Page Type"
    );
  } finally {
    setLoading(false);
  }
};

fetchBlogPageType();


}, []);

/*

# CREATE BLOG

*/

const handleSubmit = async (formData) => {
try {
setSaving(true);
setError("");


  /*
  =========================================
  FORCE BLOG PAGE TYPE
  =========================================
  */

  const data = {
    ...formData,
    pageType: blogPageType._id,

    /*
    Blog posts do not belong to a trek region.
    */

    region: formData.region || null,
  };

  const response = await fetch("/api/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to create blog post"
    );
  }

  /*
  =========================================
  REDIRECT TO BLOG LIST
  =========================================
  */

  router.push("/admin/blog");
  router.refresh();
} catch (error) {
  console.error("Create Blog error:", error);

  setError(
    error.message || "Failed to create blog post"
  );
} finally {
  setSaving(false);
}


};

/*

# LOADING

*/

if (loading) {
return ( <div className="p-6"> <div className="rounded-xl border bg-white p-8 text-center shadow-sm"> <p className="text-gray-500">
Loading Blog Page Type... </p> </div> </div>
);
}

 /*

# ERROR

*/

if (error && !blogPageType) {
return ( <div className="space-y-4 p-6"> <div> <h1 className="text-3xl font-bold text-gray-900">
Create Blog </h1>

      <p className="mt-1 text-gray-500">
        Create a new blog post.
      </p>
    </div>

    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-700">
      {error}
    </div>

    <button
      type="button"
      onClick={() => router.push("/admin/page-types")}
      className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
    >
      Go to Page Types
    </button>
  </div>
);


}

 /*

# PAGE

*/

return ( <div className="space-y-6 p-6">
{/* =========================================
HEADER
========================================= */}


  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Create Blog
    </h1>

    <p className="mt-1 text-gray-500">
      Create a new blog post or news article.
    </p>
  </div>

  {/* =========================================
      ERROR
  ========================================= */}

  {error && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
      {error}
    </div>
  )}

  {/* =========================================
      BLOG PAGE TYPE INFO
  ========================================= */}

  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <p className="text-sm text-blue-800">
      Page Type:
      <span className="ml-2 font-semibold">
        {blogPageType.name}
      </span>
    </p>
  </div>

  {/* =========================================
      PAGE FORM
  ========================================= */}

  <PageForm
    initialData={{
      pageType: blogPageType._id,
      region: "",
      published: false,
      price: {
        currency: "USD",
        pricingType: "fixed",
        amount: 0,
        paxPrices: [],
      },
    }}
    mode="create"
    loading={saving}
    onSubmit={handleSubmit}
  />
</div>


);
}
