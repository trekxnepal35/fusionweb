import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";


function SearchPageLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-700" />

            <div className="h-12 w-80 animate-pulse rounded bg-slate-700" />

            <div className="mt-4 h-6 w-full max-w-2xl animate-pulse rounded bg-slate-700" />

            <div className="mt-7 h-14 w-full animate-pulse rounded-xl bg-slate-700" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="h-52 animate-pulse bg-gray-200" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageClient/>
    </Suspense>
  );
}
