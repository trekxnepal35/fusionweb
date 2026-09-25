"use client";

import Link from "next/link";
import { useState } from "react";
import RecursiveMenu from "./RecursiveMenu";

export default function NavbarClient({ menus = [] }) {
const [mobileOpen, setMobileOpen] = useState(false);

function closeMobileMenu() {
setMobileOpen(false);
}

return ( <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">

  <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="flex items-center justify-between h-20">

      {/* LOGO */}

      <Link
        href="/"
        onClick={closeMobileMenu}
        className="
          flex
          items-center
          gap-2
          text-2xl
          font-bold
          tracking-tight
          whitespace-nowrap
        "
      >
        <span className="text-3xl">
          <img src="/fusionLogo.png" alt="Office Logo" className="w-36" />
        </span>
       
      </Link>


      {/* DESKTOP MENU + SEARCH */}

      <div className="hidden md:flex items-center w-[70%] justify-between">

        <ul className="flex items-center gap-3.5">

          <RecursiveMenu
            menus={menus}
            parentId={null}
            level={0}
            mobile={false}
            onNavigate={closeMobileMenu}
          />

        </ul>


        {/* SEARCH */}

        <Link
          href="/search"
          onClick={closeMobileMenu}
          aria-label="Search"
          title="Search"
          className="
            flex
            items-center
            justify-center
            w-10
            h-10
            rounded-full
            text-gray-700
            hover:bg-gray-100
            hover:text-gray-900
            transition
          "
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-6 h-6"
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


      {/* MOBILE BUTTONS */}

      <div className="md:hidden flex items-center gap-2">

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
            rounded-lg
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
            strokeWidth="2"
            className="w-6 h-6"
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


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            rounded-lg
            text-2xl
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


    {/* MOBILE MENU */}

    {mobileOpen && (

      <div className="md:hidden border-t border-gray-200">

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
