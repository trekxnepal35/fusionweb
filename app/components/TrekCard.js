import Link from "next/link";

export default function TrekCard({ trek }) {
  const details = trek.trekDetails || {};

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* IMAGE */}

      <Link href={`/${trek.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">

          {trek.imageUrl ? (
            <img
              src={trek.imageUrl}
              alt={trek.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {details.difficulty && (
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow">
              {details.difficulty}
            </span>
          )}

        </div>
      </Link>

      {/* CONTENT */}

      <div className="p-5">

        {trek.region?.name && (
          <p className="mb-2 text-sm font-medium text-blue-600">
            {trek.region.name}
          </p>
        )}

        <Link href={`/${trek.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 transition hover:text-blue-600">
            {trek.title}
          </h3>
        </Link>

        {trek.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
            {trek.description}
          </p>
        )}

        {/* INFO */}

        <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">

          {details.duration && (
            <div>
              <p className="text-xs text-gray-500">
                Duration
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {details.duration}
              </p>
            </div>
          )}

          {details.maxAltitude && (
            <div>
              <p className="text-xs text-gray-500">
                Max Altitude
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {details.maxAltitude}
              </p>
            </div>
          )}

        </div>

        {/* BUTTON */}

        <Link
          href={`/${trek.slug}`}
          className="mt-5 block rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Explore Trek
        </Link>

      </div>
    </article>
  );
}