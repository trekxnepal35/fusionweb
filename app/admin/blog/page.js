
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function BlogAdminPage() {
const [blogs, setBlogs] = useState([]);
const [loading, setLoading] = useState(true);
const [deletingId, setDeletingId] = useState(null);
const [error, setError] = useState("");
const [updatingId, setUpdatingId] = useState(null);

/*

# FILTERS

*/

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [sortOrder, setSortOrder] = useState("newest");

 /*

# FETCH BLOG POSTS

*/

const fetchBlogs = async () => {
try {
setLoading(true);
setError("");


  /*
  =========================================
  GET BLOG PAGES ONLY

  limit=100 prevents the default API
  pagination limit of 10 from hiding blogs.
  =========================================
  */

  const response = await fetch(
    "/api/pages?pageType=blog&page=1&limit=100",
    {
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to load blog posts"
    );
  }

  const blogPages = Array.isArray(result.data)
    ? result.data
    : [];

  setBlogs(blogPages);
} catch (error) {
  console.error("Fetch blogs error:", error);

  setError(
    error.message || "Failed to load blog posts"
  );
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

  const response = await fetch(
    `/api/pages/${id}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to delete blog post"
    );
  }

  setBlogs((currentBlogs) =>
    currentBlogs.filter(
      (blog) => blog._id !== id
    )
  );
} catch (error) {
  console.error(
    "Delete blog error:",
    error
  );

  setError(
    error.message ||
      "Failed to delete blog post"
  );
} finally {
  setDeletingId(null);
}


};

 /*

# PUBLISH / UNPUBLISH

*/

const handleTogglePublished = async (blog) => {
try {
setUpdatingId(blog._id);
setError("");

  const response = await fetch(
    `/api/pages/${blog._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...blog,

        pageType:
          blog.pageType?._id ||
          blog.pageType,

        region:
          blog.region?._id ||
          blog.region ||
          "",

        published: !blog.published,

        order: Number(blog.order) || 0,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to update blog status"
    );
  }

  setBlogs((currentBlogs) =>
    currentBlogs.map((currentBlog) =>
      currentBlog._id === blog._id
        ? {
            ...currentBlog,
            published: !blog.published,
          }
        : currentBlog
    )
  );
} catch (error) {
  console.error(
    "Update blog status error:",
    error
  );

  setError(
    error.message ||
      "Failed to update blog status"
  );
} finally {
  setUpdatingId(null);
}


};

/*

# STATISTICS

*/

const statistics = useMemo(() => {
const published = blogs.filter(
(blog) => blog.published === true
).length;

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

# FILTERED + SORTED BLOGS

*/

const filteredBlogs = useMemo(() => {
let result = [...blogs];

/*
=========================================
SEARCH
=========================================
*/

const searchValue = search
  .trim()
  .toLowerCase();

if (searchValue) {
  result = result.filter((blog) => {
    const title =
      blog.title?.toLowerCase() || "";

    const slug =
      blog.slug?.toLowerCase() || "";

    const description =
      blog.description?.toLowerCase() || "";

    return (
      title.includes(searchValue) ||
      slug.includes(searchValue) ||
      description.includes(searchValue)
    );
  });
}

/*
=========================================
STATUS FILTER
=========================================
*/

if (statusFilter === "published") {
  result = result.filter(
    (blog) => blog.published === true
  );
}

if (statusFilter === "draft") {
  result = result.filter(
    (blog) => blog.published !== true
  );
}

/*
=========================================
SORTING
=========================================
*/

result.sort((a, b) => {
  if (sortOrder === "newest") {
    return (
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
    );
  }

  if (sortOrder === "oldest") {
    return (
      new Date(a.createdAt || 0) -
      new Date(b.createdAt || 0)
    );
  }

  if (sortOrder === "title-asc") {
    return (a.title || "").localeCompare(
      b.title || ""
    );
  }

  if (sortOrder === "title-desc") {
    return (b.title || "").localeCompare(
      a.title || ""
    );
  }

  if (sortOrder === "order") {
    return (
      Number(a.order || 0) -
      Number(b.order || 0)
    );
  }

  return 0;
});

return result;


}, [
blogs,
search,
statusFilter,
sortOrder,
]);

/*

# DATE FORMATTER

*/

const formatDate = (date) => {
if (!date) return "—";


return new Date(date).toLocaleDateString(
  "en-US",
  {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
);

};

/*

# LOADING

*/

if (loading) {
return ( <div className="p-6"> <div className="rounded-xl border bg-white p-8 text-center shadow-sm"> <p className="text-gray-500">
Loading blog posts... </p> </div> </div>
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
      href="/admin/blog/create"
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
        Draft
      </p>

      <p className="mt-2 text-3xl font-bold text-yellow-600">
        {statistics.unpublished}
      </p>
    </div>

  </div>

  {/* =========================================
      FILTERS
  ========================================= */}

  <div className="rounded-xl border bg-white p-5 shadow-sm">

    <div className="grid gap-4 md:grid-cols-3">

      {/* SEARCH */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Search Blogs
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search title, slug, description..."
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* STATUS */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Status
        </label>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">
            All Blogs
          </option>

          <option value="published">
            Published
          </option>

          <option value="draft">
            Draft
          </option>
        </select>
      </div>

      {/* SORT */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Sort By
        </label>

        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value)
          }
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="title-asc">
            Title A → Z
          </option>

          <option value="title-desc">
            Title Z → A
          </option>

          <option value="order">
            Display Order
          </option>
        </select>
      </div>

    </div>

    {/* FILTER RESULT */}

    <div className="mt-4 flex flex-col justify-between gap-2 border-t pt-4 text-sm text-gray-500 sm:flex-row">

      <span>
        Showing{" "}
        <strong className="text-gray-800">
          {filteredBlogs.length}
        </strong>{" "}
        of{" "}
        <strong className="text-gray-800">
          {blogs.length}
        </strong>{" "}
        blogs
      </span>

      {(search || statusFilter !== "all") && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
          className="font-semibold text-blue-600 hover:text-blue-800"
        >
          Clear Filters
        </button>
      )}

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

    {filteredBlogs.length === 0 ? (

      <div className="p-10 text-center">

        <p className="text-gray-500">
          {blogs.length === 0
            ? "No blog posts found."
            : "No blogs match your filters."}
        </p>

        {blogs.length === 0 && (
          <Link
            href="/admin/blog/create"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Create Your First Blog
          </Link>
        )}

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
                Order
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

            {filteredBlogs.map((blog) => (

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
                        alt={
                          blog.title ||
                          "Blog image"
                        }
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

                {/* ORDER */}

                <td className="px-6 py-4">

                  <span className="text-sm text-gray-600">
                    {blog.order ?? 0}
                  </span>

                </td>

                {/* DATE */}

                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(blog.createdAt)}
                </td>

                {/* ACTIONS */}

                <td className="px-6 py-4">

                  <div className="flex flex-wrap justify-end gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleTogglePublished(blog)
                      }
                      disabled={
                        updatingId === blog._id
                      }
                      className={
                        blog.published
                          ? "rounded-lg bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                          : "rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                      }
                    >
                      {updatingId === blog._id
                        ? "Updating..."
                        : blog.published
                          ? "Unpublish"
                          : "Publish"}
                    </button>

                    <Link
                      href={`/admin/pages/edit/${blog._id}`}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(blog._id)
                      }
                      disabled={
                        deletingId === blog._id
                      }
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
