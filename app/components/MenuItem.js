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

const children = menus
.filter(
(item) =>
item.parentId &&
String(item.parentId) === String(menu._id)
)
.sort(
(a, b) =>
Number(a.order || 0) -
Number(b.order || 0)
);

const hasChildren = children.length > 0;

function handleClick(e) {
if (mobile && hasChildren) {
e.preventDefault();
setOpen((previous) => !previous);
return;
}


if (onNavigate) {
  onNavigate();
}


}



// MOBILE



if (mobile) {
return ( <li className="w-full">


    <div className="w-full border-b border-gray-100">

      <Link
        href={menu.slug || "#"}
        target={menu.target || "_self"}
        onClick={handleClick}
        className="
          flex
          items-center
          justify-between
          w-full
          px-2
          py-4
          text-[16px]
          font-medium
          text-gray-800
          transition-colors
          duration-200
          hover:text-black
        "
      >

        <span>{menu.title}</span>

        {hasChildren && (
          <span
            className={`
              flex
              items-center
              justify-center
              w-8
              h-8
              rounded-full
              bg-gray-100
              transition-all
              duration-300
              ${open ? "rotate-180 bg-gray-200" : ""}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="w-4 h-4"
            >
              <path
                d="m6 9 6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}

      </Link>


      {hasChildren && (
        <div
          className={`
            overflow-hidden
            transition-all
            duration-300
            ease-in-out
            ${
              open
                ? "max-h-[1200px] opacity-100"
                : "max-h-0 opacity-0"
            }
          `}
        >

          <div
            className="
              ml-3
              mb-2
              pl-4
              border-l
              border-gray-200
            "
          >
            <ul>

              <RecursiveMenu
                menus={menus}
                parentId={menu._id}
                level={level + 1}
                mobile={true}
                onNavigate={onNavigate}
              />

            </ul>
          </div>

        </div>
      )}

    </div>

  </li>
);


}

/*

# DESKTOP

*/

return ( <li className="group relative flex items-center">


  {/* TOP LEVEL MENU ITEM */}

  <Link
    href={menu.slug || "#"}
    target={menu.target || "_self"}
    onClick={handleClick}
    className="
      relative
      flex
      items-center
      gap-1.5
      px-3.5
      py-2
      text-[14px]
      font-medium
      text-gray-700
      whitespace-nowrap
      rounded-full
      transition-all
      duration-200
      ease-out
      hover:text-black
      hover:bg-gray-100
    "
  >

    <span>{menu.title}</span>

    {hasChildren && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="
          w-3.5
          h-3.5
          opacity-45
          transition-transform
          duration-300
          group-hover:rotate-180
        "
      >
        <path
          d="m6 9 6 6 6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}

  </Link>


  {/* ===================================================
      APPLE STYLE MEGA MENU
  =================================================== */}

  {hasChildren && (
    <div
      className="
        absolute
        top-full
        left-1/2
        -translate-x-1/2

        pt-4

        invisible
        opacity-0
        translate-y-[-10px]
        pointer-events-none

        group-hover:visible
        group-hover:opacity-100
        group-hover:translate-y-0
        group-hover:pointer-events-auto

        transition-all
        duration-300
        ease-out

        z-50
      "
    >

      <div
        className="
          relative

          w-[min(830px,calc(100vw-32px))]

          min-h-[320px]

          bg-white/95
          backdrop-blur-2xl

          border
          border-gray-200/70

          rounded-[22px]

          shadow-[0_25px_70px_rgba(0,0,0,0.14)]

          px-8
          py-10
        "
      >

        {/* =================================================
            SMALL ARROW
        ================================================= */}

        <div
          className="
            absolute
            -top-1.5
            left-1/2
            -translate-x-1/2
            w-3
            h-3
            rotate-45
            bg-white
            border-l
            border-t
            border-gray-200/70
          "
        />


        {/* =================================================
            MEGA MENU GRID
        ================================================= */}

        <div
          className="
            grid
            grid-cols-[repeat(auto-fit,minmax(145px,1fr))]
            gap-x-8
            gap-y-10
          "
        >

          {children.map((column) => (
            <MegaMenuColumn
              key={String(column._id)}
              menu={column}
              menus={menus}
              onNavigate={onNavigate}
            />
          ))}

        </div>

      </div>

    </div>
  )}

</li>


);
}

 /*

# MEGA MENU COLUMN

*/

function MegaMenuColumn({
menu,
menus,
onNavigate,
}) {
const children = menus
.filter(
(item) =>
item.parentId &&
String(item.parentId) === String(menu._id)
)
.sort(
(a, b) =>
Number(a.order || 0) -
Number(b.order || 0)
);

return ( <div className="min-w-0">


  {/* REGION TITLE */}

  <Link
    href={menu.slug || "#"}
    target={menu.target || "_self"}
    onClick={onNavigate}
    className="
      block

      mb-4
      pb-3

      border-b
      border-gray-200

      text-[13px]
      font-semibold
      uppercase
      tracking-[0.12em]

      text-gray-500

      transition-colors
      duration-200

      hover:text-gray-900
    "
  >
    {menu.title}
  </Link>


  {/* TREKS */}

  <div className="space-y-2">

    {children.map((item) => (
      <MegaMenuItem
        key={String(item._id)}
        menu={item}
        menus={menus}
        onNavigate={onNavigate}
      />
    ))}

  </div>

</div>


);
}

/*

# MEGA MENU ITEM

*/

function MegaMenuItem({
menu,
menus,
onNavigate,
}) {
const children = menus
.filter(
(item) =>
item.parentId &&
String(item.parentId) === String(menu._id)
)
.sort(
(a, b) =>
Number(a.order || 0) -
Number(b.order || 0)
);

const hasChildren = children.length > 0;

return ( <div>

  <Link
    href={menu.slug || "#"}
    target={menu.target || "_self"}
    onClick={onNavigate}
    className="
      group/item

      flex
      items-center
      justify-between
      gap-2

      w-full

      px-3
      py-2.5

      rounded-xl

      text-[14px]
      leading-5

      text-gray-600

      transition-all
      duration-200

      hover:bg-gray-200/70
      hover:text-gray-950
    "
  >

    <span>{menu.title}</span>


    {hasChildren && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="
          w-3
          h-3

          opacity-0
          -translate-x-1

          transition-all
          duration-200

          group-hover/item:opacity-60
          group-hover/item:translate-x-0
        "
      >
        <path
          d="m9 18 6-6-6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}

  </Link>


  {/* NESTED ITEMS */}

  {hasChildren && (
    <div
      className="
        ml-2
        pl-2
        border-l
        border-gray-100
      "
    >

      {children.map((child) => (
        <MegaMenuItem
          key={String(child._id)}
          menu={child}
          menus={menus}
          onNavigate={onNavigate}
        />
      ))}

    </div>
  )}

</div>


);
}
