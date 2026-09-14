"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function BlogAdminPage() {
const [blogs, setBlogs] = useState([]);
const [loading, setLoading] = useState(true);
const [deletingId, setDeletingId] = useState(null);
const [error, setError] = useState("");

/*

# FETCH BLOG POSTS

*/

const fetchBlogs = async () => {
try {
setLoading(true);
setError("");


  const response = await fetch("/api/pages", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to load blog posts");
  }

  /*
  =========================================
  ONLY BLOG PAGE TYPE
  =========================================
  */

  const allPages = result.data || [];

  const blogPages = allPages.filter(
    (page) => page.pageType?.slug === "blog"
  );

  setBlogs(blogPages);
} catch (error) {
  console.error("Fetch blogs error:", error);
  setError(error.message || "Failed to load blog posts");
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchBlogs();
}, []);

/*

# DELETE BLOG

*/

const handleDelete = async (id) => {
const confirmed = window.confirm(
"Are you sure you want to delete this blog post?"
);


if (!confirmed) return;

try {
  setDeletingId(id);
  setError("");

  const response = await fetch(`/api/pages/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete blog post");
  }

  setBlogs((currentBlogs) =>
    currentBlogs.filter((blog) => blog._id !== id)
  );
} catch (error) {
  console.error("Delete blog error:", error);
  setError(error.message || "Failed to delete blog post");
} finally {
  setDeletingId(null);
}


};

/*

# STATISTICS

*/

const statistics = useMemo(() => {
const published = blogs.filter((blog) => blog.published === true).length;


const unpublished = blogs.filter(
  (blog) => blog.published !== true
).length;

return {
  total: blogs.length,
  published,
  unpublished,
};


}, [blogs]);

/*

# DATE FORMATTER

*/

const formatDate = (date) => {
if (!date) return "—";


return new Date(date).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});


};

/*

# LOADING

*/

if (loading) {
return ( <div className="p-6"> <div className="rounded-xl border bg-white p-8 text-center shadow-sm"> <p className="text-gray-500">Loading blog posts...</p> </div> </div>
);
}

/*

# PAGE

*/

return ( <div className="space-y-6 p-6">
{/* =========================================
HEADER
========================================= */}


  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Blog
      </h1>

      <p className="mt-1 text-gray-500">
        Manage your blog posts and news articles.
      </p>
    </div>

    <Link
      href="/admin/pages/create"
      className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
    >
      + Create Blog
    </Link>
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
      STATISTICS
  ========================================= */}

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        Total Blogs
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {statistics.total}
      </p>
    </div>

    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        Published
      </p>

      <p className="mt-2 text-3xl font-bold text-green-600">
        {statistics.published}
      </p>
    </div>

    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        Unpublished
      </p>

      <p className="mt-2 text-3xl font-bold text-yellow-600">
        {statistics.unpublished}
      </p>
    </div>
  </div>

  {/* =========================================
      BLOG TABLE
  ========================================= */}

  <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
    <div className="border-b px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Blog Posts
      </h2>
    </div>

    {blogs.length === 0 ? (
      <div className="p-10 text-center">
        <p className="text-gray-500">
          No blog posts found.
        </p>

        <Link
          href="/admin/pages/create"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Create Your First Blog
        </Link>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Blog
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Slug
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Created
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {blogs.map((blog) => (
              <tr
                key={blog._id}
                className="transition hover:bg-gray-50"
              >
                {/* BLOG */}

                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title || "Blog image"}
                        className="h-16 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {blog.title}
                      </p>

                      {blog.description && (
                        <p className="mt-1 max-w-md truncate text-sm text-gray-500">
                          {blog.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* SLUG */}

                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    /{blog.slug}
                  </span>
                </td>

                {/* STATUS */}

                <td className="px-6 py-4">
                  {blog.published ? (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Draft
                    </span>
                  )}
                </td>

                {/* DATE */}

                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(blog.createdAt)}
                </td>

                {/* ACTIONS */}

                <td className="px-6 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/pages/edit/${blog._id}`}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(blog._id)}
                      disabled={deletingId === blog._id}
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === blog._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>


);
}
