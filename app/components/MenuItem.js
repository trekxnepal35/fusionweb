"use client";

import Link from "next/link";
import { useState } from "react";
import RecursiveMenu from "./RecursiveMenu";

export default function MenuItem({
  menu,
  menus,
  level = 0,
  mobile = false,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);

  const children = menus.filter(
    (item) =>
      item.parentId &&
      String(item.parentId) === String(menu._id)
  );

  const hasChildren = children.length > 0;


  function handleClick(e) {

    // Mobile parent menu
    if (mobile && hasChildren) {
      e.preventDefault();

      setOpen((previous) => !previous);

      return;
    }

    // Normal link
    if (onNavigate) {
      onNavigate();
    }
  }


  return (
    <li
      className={
        mobile
          ? "menu-item w-full"
          : "menu-item relative"
      }
    >

      <Link
        href={menu.slug || "#"}
        target={menu.target || "_self"}
        onClick={handleClick}
        className={`
          flex
          items-center
          justify-between
          gap-3
          whitespace-nowrap

          ${
            mobile
              ? `
                  w-full
                  px-4
                  py-3
                  text-base
                  font-medium
                `
              : `
                  px-4
                  py-3
                  rounded-lg
                  text-base
                  font-medium
                  transition-all
                  duration-200
                `
          }

          hover:bg-gray-100
        `}
      >

        <span>
          {menu.title}
        </span>

        {hasChildren && (
          <span className="text-xs opacity-60">
            {mobile
              ? open
                ? "▲"
                : "▼"
              : level === 0
                ? "▼"
                : "▶"}
          </span>
        )}

      </Link>


      {hasChildren && (

        <ul
          className={
            mobile
              ? `
                  submenu
                  w-full
                  pl-4
                  bg-gray-50
                  ${open ? "block" : "hidden"}
                `
              : `
                  submenu
                  absolute
                  z-50
                  hidden
                  min-w-60
                  bg-white
                  border
                  border-gray-200
                  rounded-lg
                  shadow-xl
                  py-2

                  ${
                    level === 0
                      ? "left-0 top-full"
                      : "left-full top-0"
                  }
                `
          }
        >

          <RecursiveMenu
            menus={menus}
            parentId={menu._id}
            level={level + 1}
            mobile={mobile}
            onNavigate={onNavigate}
          />

        </ul>

      )}

    </li>
  );
}