"use client";

import Link from "next/link";
import { useState } from "react";
import RecursiveMenu from "./RecursiveMenu";

export default function NavbarClient({ menus = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative">

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
              🏔️
            </span>

            <span>
              Fusion Expeditions
            </span>
          </Link>


          {/* DESKTOP MENU */}

          <div className="hidden md:block">

            <ul className="flex items-center gap-4">

              <RecursiveMenu
                menus={menus}
                parentId={null}
                level={0}
                mobile={false}
                onNavigate={closeMobileMenu}
              />

            </ul>

          </div>


          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="
              md:hidden
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