import Link from "next/link";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "@/app/components/BreadcrumbJsonLd";
import FeedbackForm from "@/app/components/FeedbackForm";
import FeedbackList from "@/app/components/FeedbackList";
import JsonLd from "@/app/components/JsonLd";


/*
==================================================
GET CURRENT BLOG
==================================================
*/

async function getBlog(slug) {
  try {
    const baseUrl =
      process.env.BASE_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/pages?slug=${encodeURIComponent(
        slug
      )}&pageType=blog&published=true`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result?.success) {
      return null;
    }

    const blog = result?.data?.[0];

    if (!blog || !blog._id) {
      return null;
    }

    const pageTypeSlug =
      blog.pageType?.slug ||
      blog.pageTypeSlug ||
      "";

    if (
      pageTypeSlug &&
      pageTypeSlug.toLowerCase() !== "blog"
    ) {
      return null;
    }

    return blog;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}


/*
==================================================
DYNAMIC BLOG SEO METADATA
==================================================
*/

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  /*
  ================================================
  BLOG NOT FOUND OR UNPUBLISHED
  ================================================
  */

  if (!blog) {
    return {
      title: "Blog Not Found | Trek X Nepal",

      description:
        "The requested blog article could not be found.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl =
    process.env.BASE_URL ||
    "http://localhost:3000";

  const blogUrl = `${baseUrl}/blog/${blog.slug}`;

  /*
  ================================================
  SEO DATA
  ================================================
  */

  const seo = blog.seo || {};

  const title =
    seo.metaTitle?.trim() ||
    blog.title ||
    "Nepal Travel Blog | Trek X Nepal";

  const description =
    seo.metaDescription?.trim() ||
    blog.description?.trim() ||
    "Read trekking guides, travel stories, and useful travel tips from Trek X Nepal.";

  const keywords = Array.isArray(seo.keywords)
    ? seo.keywords.filter(
        (keyword) =>
          typeof keyword === "string" &&
          keyword.trim() !== ""
      )
    : [];

  /*
  ================================================
  CANONICAL URL
  ================================================
  */

  const canonicalUrl =
    seo.canonicalUrl?.trim() ||
    blogUrl;

  /*
  ================================================
  OPEN GRAPH
  ================================================
  */

  const ogTitle =
    seo.ogTitle?.trim() ||
    title;

  const ogDescription =
    seo.ogDescription?.trim() ||
    description;

  const ogImage =
    seo.ogImage?.trim() ||
    blog.imageUrl ||
    "";

  /*
  ================================================
  RETURN METADATA
  ================================================
  */

  return {
    /*
    ==============================================
    BASIC SEO
    ==============================================
    */

    title,

    description,

    ...(keywords.length > 0
      ? {
          keywords,
        }
      : {}),

    /*
    ==============================================
    CANONICAL
    ==============================================
    */

    alternates: {
      canonical: canonicalUrl,
    },

    /*
    ==============================================
    ROBOTS
    ==============================================
    */

    robots: {
      index: seo.noIndex ? false : true,
      follow: true,
    },

    /*
    ==============================================
    OPEN GRAPH
    ==============================================
    */

    openGraph: {
      title: ogTitle,

      description: ogDescription,

      url: canonicalUrl,

      siteName: "Trek X Nepal",

      type: "article",

      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt:
                  blog.title ||
                  "Trek X Nepal Blog",
              },
            ],
          }
        : {}),

      ...(blog.createdAt
        ? {
            publishedTime: new Date(
              blog.createdAt
            ).toISOString(),
          }
        : {}),

      ...(blog.updatedAt
        ? {
            modifiedTime: new Date(
              blog.updatedAt
            ).toISOString(),
          }
        : {}),
    },

    /*
    ==============================================
    TWITTER
    ==============================================
    */

    twitter: {
      card: ogImage
        ? "summary_large_image"
        : "summary",

      title: ogTitle,

      description: ogDescription,

      ...(ogImage
        ? {
            images: [ogImage],
          }
        : {}),
    },
  };
}


/*
==================================================
GET ALL BLOGS FOR NAVIGATION
==================================================
*/

async function getBlogNavigation() {
  try {
    const baseUrl =
      process.env.BASE_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/pages?pageType=blog&published=true&page=1&limit=100`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    if (!result?.success) {
      return [];
    }

    return Array.isArray(result.data)
      ? result.data
      : [];
  } catch (error) {
    console.error(
      "Error fetching blog navigation:",
      error
    );

    return [];
  }
}


/*
==================================================
BLOG DETAIL PAGE
==================================================
*/

export default async function BlogDetailPage({
  params,
}) {
  const { slug } = await params;

  /*
  ================================================
  GET CURRENT BLOG
  ================================================
  */

  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  /*
  ================================================
  GET BLOG NAVIGATION
  ================================================
  */

  const allBlogs =
    await getBlogNavigation();

  /*
  ================================================
  FIND CURRENT BLOG INDEX
  ================================================
  */

  const currentIndex =
    allBlogs.findIndex(
      (item) =>
        String(item._id) ===
        String(blog._id)
    );

  /*
  ================================================
  PREVIOUS BLOG
  ================================================
  */

  const previousBlog =
    currentIndex > 0
      ? allBlogs[currentIndex - 1]
      : null;

  /*
  ================================================
  NEXT BLOG
  ================================================
  */

  const nextBlog =
    currentIndex >= 0 &&
    currentIndex < allBlogs.length - 1
      ? allBlogs[currentIndex + 1]
      : null;

  /*
  ================================================
  RELATED BLOGS
  ================================================
  */

  const relatedBlogs = allBlogs
    .filter(
      (item) =>
        String(item._id) !==
        String(blog._id)
    )
    .slice(0, 3);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  /*
  ================================================
  ARTICLE JSON-LD
  ================================================
  */

  const articleJsonLd = {
    "@context": "https://schema.org",

    "@type": "Article",

    headline: blog.title,

    description:
      blog.description || "",

    image: blog.imageUrl
      ? [blog.imageUrl]
      : undefined,

    /*
    ==============================================
    ARTICLE DATES
    ==============================================
    */

    datePublished: blog.createdAt
      ? new Date(
          blog.createdAt
        ).toISOString()
      : undefined,

    dateModified: blog.updatedAt
      ? new Date(
          blog.updatedAt
        ).toISOString()
      : undefined,

    /*
    ==============================================
    AUTHOR
    ==============================================
    */

    author: {
      "@type": "Organization",

      name: "Trek X Nepal",

      url: baseUrl,
    },

    /*
    ==============================================
    MAIN PAGE
    ==============================================
    */

    mainEntityOfPage: {
      "@type": "WebPage",

      "@id":
        `${baseUrl}/blog/${blog.slug}`,
    },

    /*
    ==============================================
    ARTICLE URL
    ==============================================
    */

    url:
      `${baseUrl}/blog/${blog.slug}`,

    /*
    ==============================================
    PUBLISHER
    ==============================================
    */

    publisher: {
      "@type": "Organization",

      name: "Trek X Nepal",

      url: baseUrl,
    },
  };

  /*
  ================================================
  REMOVE UNDEFINED VALUES
  ================================================
  */

  Object.keys(articleJsonLd).forEach(
    (key) => {
      if (
        articleJsonLd[key] ===
        undefined
      ) {
        delete articleJsonLd[key];
      }
    }
  );

  /*
  ================================================
  BLOG BREADCRUMB JSON-LD
  ================================================
  */

  const breadcrumbItems = [
    {
      name: "Home",
      url: baseUrl,
    },

    {
      name: "Blog",
      url: `${baseUrl}/blog`,
    },

    {
      name: blog.title,
      url:
        `${baseUrl}/blog/${blog.slug}`,
    },
  ];

  return (
    <main className="min-h-screen bg-white">

      {/* ========================================
          ARTICLE JSON-LD
      ======================================== */}

      <JsonLd data={articleJsonLd}/>

      {/* ========================================
          BREADCRUMB JSON-LD
      ======================================== */}

      <BreadcrumbJsonLd
        items={breadcrumbItems}
      />

      {/* ========================================
          VISUAL BREADCRUMB
      ======================================== */}

      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-gray-500">

          <Link
            href="/"
            className="
              transition
              hover:text-blue-600
            "
          >
            Home
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            href="/blog"
            className="
              transition
              hover:text-blue-600
            "
          >
            Blog
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="text-gray-800">
            {blog.title}
          </span>

        </div>
      </div>

      {/* ========================================
          BLOG ARTICLE
      ======================================== */}

      <article className="mx-auto max-w-5xl px-4 py-10 sm:py-16">

        {/* ======================================
            HEADER
        ====================================== */}

        <header className="mx-auto max-w-4xl text-center">

          <h1
            className="
              text-3xl
              font-bold
              leading-tight
              text-gray-900
              sm:text-4xl
              lg:text-5xl
            "
          >
            {blog.title}
          </h1>

          {blog.description && (
            <p
              className="
                mx-auto
                mt-6
                max-w-3xl
                text-base
                leading-7
                text-gray-600
                sm:text-lg
              "
            >
              {blog.description}
            </p>
          )}

        </header>

        {/* ======================================
            FEATURED IMAGE
        ====================================== */}

        {blog.imageUrl && (
          <div
            className="
              mx-auto
              mt-10
              overflow-hidden
              rounded-2xl
            "
          >
            <img
              src={blog.imageUrl}
              alt={
                blog.title ||
                "Blog image"
              }
              className="
                max-h-[600px]
                w-full
                object-cover
              "
            />
          </div>
        )}

        {/* ======================================
            BLOG CONTENT
        ====================================== */}

        <div
          className="
            mx-auto
            mt-10
            max-w-4xl
          "
        >
          <div
            className="
              prose
              prose-lg
              max-w-none
              prose-headings:font-bold
              prose-headings:text-gray-900
              prose-p:leading-8
              prose-p:text-gray-700
              prose-a:text-blue-600
              prose-a:no-underline
              prose-a:hover:underline
              prose-img:rounded-xl
              prose-strong:text-gray-900
            "
            dangerouslySetInnerHTML={{
              __html:
                blog.content || "",
            }}
          />
        </div>

        {/* ======================================
            PREVIOUS / NEXT BLOG
        ====================================== */}

        {(previousBlog ||
          nextBlog) && (
          <div
            className="
              mx-auto
              mt-14
              max-w-4xl
              border-t
              border-b
              py-8
            "
          >
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
              "
            >

              {/* ==================================
                  PREVIOUS
              ================================== */}

              <div>
                {previousBlog ? (
                  <Link
                    href={`/blog/${previousBlog.slug}`}
                    className="
                      group
                      block
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      p-5
                      transition
                      hover:border-blue-300
                      hover:bg-blue-50
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-gray-500
                      "
                    >
                      ← Previous Article
                    </p>

                    <h3
                      className="
                        mt-2
                        line-clamp-2
                        font-bold
                        text-gray-900
                        transition
                        group-hover:text-blue-600
                      "
                    >
                      {previousBlog.title}
                    </h3>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              {/* ==================================
                  NEXT
              ================================== */}

              <div>
                {nextBlog ? (
                  <Link
                    href={`/blog/${nextBlog.slug}`}
                    className="
                      group
                      block
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      p-5
                      text-left
                      transition
                      hover:border-blue-300
                      hover:bg-blue-50
                      sm:text-right
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-gray-500
                      "
                    >
                      Next Article →
                    </p>

                    <h3
                      className="
                        mt-2
                        line-clamp-2
                        font-bold
                        text-gray-900
                        transition
                        group-hover:text-blue-600
                      "
                    >
                      {nextBlog.title}
                    </h3>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================
            RELATED BLOG POSTS
        ====================================== */}

        {relatedBlogs.length > 0 && (
          <section
            className="
              mx-auto
              mt-14
              max-w-4xl
            "
          >

            <div className="mb-7">

              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                  sm:text-3xl
                "
              >
                Related Articles
              </h2>

              <p
                className="
                  mt-2
                  text-gray-600
                "
              >
                Continue exploring our
                latest travel stories
                and guides.
              </p>

            </div>

            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {relatedBlogs.map(
                (relatedBlog) => (
                  <article
                    key={
                      relatedBlog._id
                    }
                    className="
                      group
                      overflow-hidden
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      transition
                      hover:-translate-y-1
                      hover:shadow-lg
                    "
                  >

                    {/* ==========================
                        RELATED IMAGE
                    ========================== */}

                    <Link
                      href={`/blog/${relatedBlog.slug}`}
                    >
                      <div
                        className="
                          h-40
                          overflow-hidden
                          bg-gray-200
                        "
                      >

                        {relatedBlog.imageUrl ? (
                          <img
                            src={
                              relatedBlog.imageUrl
                            }
                            alt={
                              relatedBlog.title ||
                              "Related blog image"
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition
                              duration-500
                              group-hover:scale-105
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-full
                              items-center
                              justify-center
                              text-sm
                              text-gray-500
                            "
                          >
                            No Image
                          </div>
                        )}

                      </div>
                    </Link>

                    {/* ==========================
                        RELATED CONTENT
                    ========================== */}

                    <div className="p-5">

                      <h3
                        className="
                          line-clamp-2
                          font-bold
                          text-gray-900
                          transition
                          group-hover:text-blue-600
                        "
                      >
                        <Link
                          href={`/blog/${relatedBlog.slug}`}
                        >
                          {relatedBlog.title}
                        </Link>
                      </h3>

                      {relatedBlog.description && (
                        <p
                          className="
                            mt-2
                            line-clamp-3
                            text-sm
                            leading-6
                            text-gray-600
                          "
                        >
                          {
                            relatedBlog.description
                          }
                        </p>
                      )}

                      <Link
                        href={`/blog/${relatedBlog.slug}`}
                        className="
                          mt-4
                          inline-flex
                          font-semibold
                          text-blue-600
                          hover:text-blue-800
                        "
                      >
                        Read More →
                      </Link>

                    </div>

                  </article>
                )
              )}

            </div>

          </section>
        )}

        {/* ======================================
            FEEDBACK / COMMENTS
        ====================================== */}

        <section
          className="
            mx-auto
            mt-14
            max-w-4xl
          "
        >

          {/* ====================================
              APPROVED COMMENTS
          ==================================== */}

          <FeedbackList
            pageId={blog._id}
          />

          {/* ====================================
              LEAVE A COMMENT
          ==================================== */}

          <FeedbackForm
            pageId={blog._id}
            pageTitle={blog.title}
          />

        </section>

        {/* ======================================
            BACK TO BLOG
        ====================================== */}

        <div
          className="
            mx-auto
            mt-12
            max-w-4xl
            border-t
            pt-8
          "
        >
          <Link
            href="/blog"
            className="
              inline-flex
              items-center
              rounded-lg
              bg-blue-600
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <span className="mr-2">
              ←
            </span>

            Back to Blog
          </Link>
        </div>

      </article>

    </main>
  );
}