import Link from "next/link";

export default function AdminLayout({ children }) {
return ( <div className="min-h-screen bg-gray-100">

  {/* =========================================
      ADMIN HEADER
  ========================================= */}

  <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">

    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

      <Link
        href="/admin"
        className="text-xl font-bold text-gray-900"
      >
        Trek Nepal Admin
      </Link>

      <Link
        href="/"
        target="_blank"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        View Website ↗
      </Link>

    </div>

  </header>


  {/* =========================================
      MAIN ADMIN AREA
  ========================================= */}

  <div className="flex min-h-[calc(100vh-4rem)]">


    {/* =======================================
        SIDEBAR
    ======================================= */}

    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white md:block">

      <div className="sticky top-16 p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Administration
        </p>


        <nav className="space-y-1">


          {/* =================================
              DASHBOARD
          ================================= */}

          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              🏠
            </span>

            <span>
              Dashboard
            </span>
          </Link>


          {/* =================================
              NAVBAR
          ================================= */}

          <Link
            href="/admin/navbar"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              🧭
            </span>

            <span>
              Navbar
            </span>
          </Link>


          {/* =================================
              PAGE TYPES
          ================================= */}

          <Link
            href="/admin/page-types"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              🏷️
            </span>

            <span>
              Page Types
            </span>
          </Link>


          {/* =================================
              PAGES
          ================================= */}

          <Link
            href="/admin/pages"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              📄
            </span>

            <span>
              Pages
            </span>
          </Link>


          {/* =================================
              BLOG
          ================================= */}

          <Link
            href="/admin/blog"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              📝
            </span>

            <span>
              Blog
            </span>
          </Link>


          {/* =================================
              REGIONS
          ================================= */}

          <Link
            href="/admin/regions"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              🌄
            </span>

            <span>
              Regions
            </span>
          </Link>


          {/* =================================
              FEEDBACK / COMMENTS
          ================================= */}

          <Link
            href="/admin/feedback"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              💬
            </span>

            <span>
              Feedback / Comments
            </span>
          </Link>


          {/* =================================
              BOOKINGS
          ================================= */}

          <Link
            href="/admin/bookings"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              📅
            </span>

            <span>
              Bookings
            </span>
          </Link>


          {/* =================================
              ENQUIRIES
          ================================= */}

          <Link
            href="/admin/enquiries"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              ✉️
            </span>

            <span>
              Enquiries
            </span>
          </Link>


          {/* =================================
              CONTACT MESSAGES
          ================================= */}

          <Link
            href="/admin/contact"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-lg">
              📩
            </span>

            <span>
              Contact Messages
            </span>
          </Link>

        </nav>


        {/* =====================================
            ADMIN INFORMATION
        ===================================== */}

        <div className="mt-8 border-t border-gray-200 pt-6">

          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Website
          </p>

          <Link
            href="/"
            target="_blank"
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <span className="text-lg">
              🌐
            </span>

            <span>
              Visit Website
            </span>
          </Link>

        </div>

      </div>

    </aside>


    {/* =======================================
        CONTENT
    ======================================= */}

    <main className="min-w-0 flex-1">

      <div className="p-4 sm:p-6 lg:p-8">

        {children}

      </div>

    </main>

  </div>

</div>

);
}
