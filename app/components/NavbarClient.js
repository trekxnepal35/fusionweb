"use client";

import Link from "next/link";
import { useState } from "react";
import RecursiveMenu from "./RecursiveMenu";

export default function NavbarClient({ menus = [] }) {
const [mobileOpen, setMobileOpen] = useState(false);

function closeMobileMenu() {
setMobileOpen(false);
}

return ( <header
   className="
     fixed
     top-0
     left-0
     right-0
     z-50
     bg-white/90
     backdrop-blur-xl
     border-b
     border-gray-200/70
   "
 > <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">


    {/* =================================================
        MAIN NAVBAR
    ================================================= */}

    <div className="flex items-center h-20">

      {/* =================================================
          LOGO
      ================================================= */}

      <Link
        href="/"
        onClick={closeMobileMenu}
        className="
          flex
          items-center
          shrink-0
          mr-8
          lg:mr-10
        "
      >
        <img
          src="/fusionLogo.png"
          alt="Office Logo"
          className="
            w-32
            sm:w-36
            h-auto
          "
        />
      </Link>


      {/* =================================================
          DESKTOP NAVIGATION
      ================================================= */}

      <div
        className="
          hidden
          md:flex
          flex-1
          items-center
          justify-center
        "
      >

        <ul
          className="
            flex
            items-center
            justify-center
            gap-5
          "
        >
          <RecursiveMenu
            menus={menus}
            parentId={null}
            level={0}
            mobile={false}
            onNavigate={closeMobileMenu}
          />
        </ul>


        {/* =================================================
            SEARCH
        ================================================= */}

        <Link
          href="/search"
          onClick={closeMobileMenu}
          aria-label="Search"
          title="Search"
          className="
            ml-3
            flex
            items-center
            justify-center
            w-10
            h-10
            shrink-0
            rounded-full
            text-gray-600
            transition-all
            duration-200
            hover:bg-gray-100
            hover:text-gray-950
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path
              d="m20 20-3.5-3.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>

      </div>


      {/* =================================================
          MOBILE BUTTONS
      ================================================= */}

      <div
        className="
          md:hidden
          flex
          items-center
          gap-1
          ml-auto
        "
      >

        {/* MOBILE SEARCH */}

        <Link
          href="/search"
          onClick={closeMobileMenu}
          aria-label="Search"
          title="Search"
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            rounded-full
            text-gray-700
            hover:bg-gray-100
            transition
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-5.5 h-5.5"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path
              d="m20 20-3.5-3.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>


        {/* MOBILE MENU */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen((value) => !value)
          }
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            rounded-full
            text-xl
            text-gray-700
            hover:bg-gray-100
            transition
          "
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

      </div>

    </div>


    {/* =================================================
        MOBILE MENU
    ================================================= */}

    {mobileOpen && (
      <div
        className="
          md:hidden
          border-t
          border-gray-200/70
          bg-white
        "
      >
        <ul className="py-3">

          <RecursiveMenu
            menus={menus}
            parentId={null}
            level={0}
            mobile={true}
            onNavigate={closeMobileMenu}
          />

        </ul>
      </div>
    )}

  </nav>
</header>


);
}
