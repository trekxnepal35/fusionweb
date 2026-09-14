import Link from "next/link";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center gap-2"
            >

              {!isLast ? (
                <>
                  <Link
                    href={item.url}
                    className="text-gray-500 hover:text-blue-600 transition"
                  >
                    {item.name}
                  </Link>

                  <span className="text-gray-400">
                    /
                  </span>
                </>
              ) : (
                <span
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {item.name}
                </span>
              )}

            </li>
          );
        })}

      </ol>
    </nav>
  );
}