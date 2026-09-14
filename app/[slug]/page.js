
import Link from "next/link";
import TrekJsonLd from "../components/TrekJsonLd";
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd'
import Breadcrumbs from "@/app/components/Breadcrumbs";
// SEO
export async function generateMetadata({ params }) {

  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  try {

    const response = await fetch(
      `${baseUrl}/api/pages?slug=${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        title: "Page Not Found",
      };
    }

    const result = await response.json();

    const page = Array.isArray(result.data)
      ? result.data[0]
      : result.data;

    if (!page) {
      return {
        title: "Page Not Found",
      };
    }

    const seo = page.seo || {};

    const title =
      seo.metaTitle ||
      page.title ||
      "Trek Nepal";

    const description =
      seo.metaDescription ||
      page.description ||
      "";

    const keywords =
      seo.keywords || [];

    const ogTitle =
      seo.ogTitle ||
      title;

    const ogDescription =
      seo.ogDescription ||
      description;

    const ogImage =
      seo.ogImage ||
      page.imageUrl ||
      "";


    return {

      title,

      description,

      keywords,

      robots: {
        index: !seo.noIndex,
        follow: !seo.noIndex,
      },

      alternates: seo.canonicalUrl
        ? {
          canonical: seo.canonicalUrl,
        }
        : undefined,

      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: "website",

        ...(ogImage
          ? {
            images: [
              {
                url: ogImage,
                alt: title,
              },
            ],
          }
          : {}),
      },

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

  } catch (error) {

    console.error(
      "SEO metadata error:",
      error
    );

    return {
      title: "Trek Nepal",
      description:
        "Explore trekking destinations and adventures in Nepal.",
    };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;



  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/pages?slug=${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return <NotFound />;
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    return <NotFound />;
  }

  const page = Array.isArray(result.data)
    ? result.data[0]
    : result.data;

  if (!page) {
    return <NotFound />;
  }

  // =========================================
  // TREK PAGE
  // =========================================

  if (page.pageType === "trek") {
    return <TrekPage trek={page} />;
  }
  // =========================================
  // TOUR PAGE
  // 

  if (page.pageType === "tour") {
    return <TourPage tour={page} />;
  }


  // =========================================
  // GENERAL PAGE
  // =========================================

  return <GeneralPage page={page} />;
}


// =====================================================
// TREK PAGE
// =====================================================

function TrekPage({ trek }) {
  const details = trek.trekDetails || {};

  // SEO Data
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";
  const breadcrumbItems = [
    {
      name: "Home",
      url: `${baseUrl}/`,
    },
    {
      name: "Treks",
      url: `${baseUrl}/treks`,
    },
  ];

  if (trek.region) {
    breadcrumbItems.push({
      name: trek.region.name,
      url: `${baseUrl}/treks/${trek.region.slug}`,
    });
  }

  breadcrumbItems.push({
    name: trek.title,
    url: `${baseUrl}/${trek.slug}`,
  });
  const visibleBreadcrumbs = breadcrumbItems.map((item) => ({
    ...item,
    url: new URL(item.url).pathname,
  }));



  return (
    <main className="min-h-screen bg-white">
      {/* SEO DataBase */}
      <TrekJsonLd
        trek={trek}
        baseUrl={
          process.env.NEXT_PUBLIC_BASE_URL ||
          "http://localhost:3000"
        }
      />
      <BreadcrumbJsonLd
        items={[
          {
            name: "Home",
            url:
              `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/`,
          },

          ...(trek.region
            ? [
              {
                name: trek.region.name,

                url:
                  `${process.env.NEXT_PUBLIC_BASE_URL ||
                  "http://localhost:3000"
                  }/treks/${trek.region.slug}`,
              },
            ]
            : []),

          {
            name: trek.title,

            url:
              `${process.env.NEXT_PUBLIC_BASE_URL ||
              "http://localhost:3000"
              }/${trek.slug}`,
          },
        ]}
      />
      <Breadcrumbs
        items={breadcrumbItems.map((item) => ({
          ...item,
          url: new URL(item.url).pathname,
        }))}
      />

      {/* HERO */}
      <section className="relative">

        {trek.imageUrl ? (
          <div className="h-[450px] w-full">
            <img
              src={trek.imageUrl}
              alt={trek.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-[350px] bg-gray-200" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-12">

            {trek.region && (
              <p className="mb-3 text-sm font-medium text-white">
                {trek.region.name}
              </p>
            )}

            <h1 className="text-4xl font-bold text-white md:text-6xl">
              {trek.title}
            </h1>

            {trek.description && (
              <p className="mt-4 max-w-3xl text-lg text-white">
                {trek.description}
              </p>
            )}

          </div>
        </div>

      </section>


      {/* QUICK INFO */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4">

          <InfoItem
            label="Duration"
            value={details.duration}
          />

          <InfoItem
            label="Difficulty"
            value={details.difficulty}
          />

          <InfoItem
            label="Max Altitude"
            value={details.maxAltitude}
          />

          <InfoItem
            label="Best Season"
            value={details.bestSeason}
          />

        </div>
      </section>



      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 lg:grid-cols-3">

          {/* MAIN */}
          <div className="lg:col-span-2">

            {trek.content && (
              <section className="mb-12">
                <SectionTitle title="Overview" />

                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: trek.content,
                  }}
                />
              </section>
            )}


            {/* ITINERARY */}

            {trek.itinerary?.length > 0 && (
              <section className="mb-12">

                <SectionTitle title="Itinerary" />

                <div className="space-y-6">

                  {trek.itinerary.map((day, index) => (
                    <div
                      key={index}
                      className="rounded-xl border p-6"
                    >

                      <div className="mb-3 flex items-center gap-3">

                        <span className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                          Day {day.day}
                        </span>

                        <h3 className="text-xl font-semibold">
                          {day.title}
                        </h3>

                      </div>

                      {day.description && (
                        <p className="text-gray-600">
                          {day.description}
                        </p>
                      )}

                      {day.altitude && (
                        <p className="mt-3 text-sm font-medium">
                          Altitude: {day.altitude}
                        </p>
                      )}

                    </div>
                  ))}

                </div>

              </section>
            )}


            {/* INCLUSIONS */}

            {trek.inclusions?.length > 0 && (
              <section className="mb-10">

                <SectionTitle title="Inclusions" />

                <ul className="space-y-3">

                  {trek.inclusions.map((item, index) => (
                    <li key={index}>
                      ✓ {item}
                    </li>
                  ))}

                </ul>

              </section>
            )}


            {/* EXCLUSIONS */}

            {trek.exclusions?.length > 0 && (
              <section className="mb-10">

                <SectionTitle title="Exclusions" />

                <ul className="space-y-3">

                  {trek.exclusions.map((item, index) => (
                    <li key={index}>
                      ✕ {item}
                    </li>
                  ))}

                </ul>

              </section>
            )}

          </div>


          {/* SIDEBAR */}

          <aside>

            <div className="sticky top-24 rounded-2xl border bg-gray-50 p-6">

              <h2 className="mb-6 text-2xl font-bold">
                Trek Information
              </h2>
              {/* Price for Track */}
              {trek.price?.amount > 0 && (
                <div className="mt-6 rounded-2xl bg-gray-50 p-6">

                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {trek.price.priceType === "starting_from"
                      ? "Starting From"
                      : "Package Price"}
                  </p>

                  <div className="mt-2 flex items-end gap-2">

                    <span className="text-4xl font-bold text-gray-900">
                      {trek.price.currency === "USD" && "$"}
                      {trek.price.currency === "EUR" && "€"}
                      {trek.price.currency === "GBP" && "£"}
                      {trek.price.currency === "NPR" && "रू"}

                      {Number(trek.price.amount).toLocaleString()}
                    </span>

                    <span className="mb-1 text-gray-500">
                      {trek.price.priceType === "per_person"
                        ? "per person"
                        : trek.price.priceType === "per_group"
                          ? "per group"
                          : ""}
                    </span>

                  </div>

                </div>
              )}

              <div className="space-y-4">

                <InfoItem
                  label="Accommodation"
                  value={details.accommodation}
                />

                <InfoItem
                  label="Meals"
                  value={details.meals}
                />

                <InfoItem
                  label="Group Size"
                  value={details.groupSize}
                />

                <InfoItem
                  label="Best Season"
                  value={details.bestSeason}
                />

              </div>



              {/* Booking */}
              <Link
                href={`/booking?experienceId=${trek._id}&experienceType=trek`}
                className="..."
              >
                Book This Trek
              </Link>

            </div>

          </aside>

        </div>

      </section>


      {/* IMPORTANT INFORMATION */}

      {trek.importantInformation && (
        <section className="mx-auto max-w-7xl px-6 pb-12">

          <div className="rounded-xl bg-yellow-50 p-6">

            <h2 className="mb-3 text-2xl font-bold">
              Important Information
            </h2>

            <p className="text-gray-700">
              {trek.importantInformation}
            </p>

          </div>

        </section>
      )}

    </main>
  );
}


// =====================================================
// GENERAL PAGE
// =====================================================

function GeneralPage({ page }) {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}

      <section className="bg-gray-100">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <h1 className="text-4xl font-bold md:text-5xl">
            {page.title}
          </h1>

          {page.description && (
            <p className="mt-4 max-w-3xl text-lg text-gray-600">
              {page.description}
            </p>
          )}

        </div>

      </section>


      {/* IMAGE */}

      {page.imageUrl && (
        <section className="mx-auto max-w-7xl px-6 py-10">

          <img
            src={page.imageUrl}
            alt={page.title}
            className="max-h-[500px] w-full rounded-2xl object-cover"
          />

        </section>
      )}


      {/* CONTENT */}

      <section className="mx-auto max-w-4xl px-6 py-12">

        {page.content && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: page.content,
            }}
          />
        )}

      </section>

    </main>
  );
}


// =====================================================
// SMALL COMPONENTS
// =====================================================

function InfoItem({ label, value }) {

  if (!value) return null;

  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}


function SectionTitle({ title }) {
  return (
    <h2 className="mb-6 text-3xl font-bold">
      {title}
    </h2>
  );
}


function NotFound() {

  return (
    <main className="flex min-h-[60vh] items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold">
          Page Not Found
        </h1>

        <p className="mt-4 text-gray-600">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-white"
        >
          Back to Home
        </Link>

      </div>

    </main>
  );
}

// Tour Page
function TourPage({ tour }) {
  const details = tour.tourDetails || {};

  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative h-[55vh] min-h-[420px]">

          {tour.imageUrl ? (
            <img
              src={tour.imageUrl}
              alt={tour.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-900" />
          )}

          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">

              <div className="max-w-4xl text-white">

                <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
                  Nepal Tour
                </span>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {tour.title}
                </h1>

                {tour.description && (
                  <p className="mt-5 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">
                    {tour.description}
                  </p>
                )}

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* TOUR QUICK DETAILS */}
      <section className="relative -mt-8 z-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">

          <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-4">

            <TourInfo
              label="Duration"
              value={details.duration}
            />

            <TourInfo
              label="Destination"
              value={details.destination}
            />

            <TourInfo
              label="Tour Type"
              value={details.tourType}
            />

            <TourInfo
              label="Best Season"
              value={details.bestSeason}
            />

          </div>

        </div>
      </section>


      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

        <div className="grid gap-12 lg:grid-cols-[1fr_350px]">

          {/* LEFT */}
          <div>

            {/* ABOUT */}
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Explore Nepal
              </p>

              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                About This Tour
              </h2>

              {tour.content && (
                <div
                  className="prose prose-lg mt-6 max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: tour.content,
                  }}
                />
              )}
            </div>


            {/* ITINERARY */}
            {tour.itinerary?.length > 0 && (
              <section className="mt-16">

                <h2 className="text-3xl font-bold text-gray-900">
                  Tour Itinerary
                </h2>

                <div className="mt-8 space-y-5">

                  {tour.itinerary.map((day, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex gap-5">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                          {day.day}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {day.title}
                          </h3>

                          {day.altitude && (
                            <p className="mt-1 text-sm font-medium text-blue-600">
                              {day.altitude}
                            </p>
                          )}

                          {day.description && (
                            <p className="mt-3 leading-7 text-gray-600">
                              {day.description}
                            </p>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}

                </div>

              </section>
            )}


            {/* INCLUSIONS / EXCLUSIONS */}
            <section className="mt-16 grid gap-6 md:grid-cols-2">

              {tour.inclusions?.length > 0 && (
                <div className="rounded-2xl bg-gray-50 p-7">

                  <h2 className="text-2xl font-bold text-gray-900">
                    What's Included
                  </h2>

                  <ul className="mt-5 space-y-3">
                    {tour.inclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-gray-600"
                      >
                        <span className="font-bold text-green-600">
                          ✓
                        </span>

                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                </div>
              )}


              {tour.exclusions?.length > 0 && (
                <div className="rounded-2xl bg-gray-50 p-7">

                  <h2 className="text-2xl font-bold text-gray-900">
                    What's Not Included
                  </h2>

                  <ul className="mt-5 space-y-3">
                    {tour.exclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-gray-600"
                      >
                        <span className="font-bold text-red-500">
                          ×
                        </span>

                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                </div>
              )}

            </section>


            {/* IMPORTANT INFORMATION */}
            {tour.importantInformation && (
              <section className="mt-16 rounded-2xl border border-yellow-200 bg-yellow-50 p-7">

                <h2 className="text-2xl font-bold text-gray-900">
                  Important Information
                </h2>

                <div
                  className="prose mt-4 max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: tour.importantInformation,
                  }}
                />

              </section>
            )}

          </div>


          {/* RIGHT SIDEBAR */}
          <aside>

            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-7 shadow-lg">

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Plan Your Trip
              </p>

              {/* Price for Tour */}
              {tour.price?.amount > 0 && (
                <div className="mb-6 rounded-2xl bg-gray-50 p-6">

                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {tour.price.priceType === "starting_from"
                      ? "Starting From"
                      : "Package Price"}
                  </p>

                  <div className="mt-2">

                    <span className="text-4xl font-bold text-gray-900">
                      {tour.price.currency === "USD" && "$"}
                      {tour.price.currency === "EUR" && "€"}
                      {tour.price.currency === "GBP" && "£"}
                      {tour.price.currency === "NPR" && "रू"}

                      {Number(tour.price.amount).toLocaleString()}
                    </span>

                    <p className="mt-1 text-sm text-gray-500">
                      {tour.price.priceType === "per_person"
                        ? "per person"
                        : tour.price.priceType === "per_group"
                          ? "per group"
                          : ""}
                    </p>

                  </div>

                </div>
              )}

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Ready to Explore Nepal?
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Contact us to customize this tour or check availability.
              </p>



              <div className="mt-7 border-t border-gray-200 pt-6">

                <TourSideInfo
                  label="Group Size"
                  value={details.groupSize}
                />

                <TourSideInfo
                  label="Accommodation"
                  value={details.accommodation}
                />

                <TourSideInfo
                  label="Transportation"
                  value={details.transportation}
                />

              </div>

            </div>
            {/* Booking Tour */}
            <Link
              href={`/booking?experienceId=${tour._id}&experienceType=tour`}
              className="..."
            >
              Book This Tour
            </Link>

          </aside>

        </div>

      </section>

    </main>
  );
}

//  Tour Info
function TourInfo({ label, value }) {
  if (!value) return null;

  return (
    <div className="border-b border-gray-100 p-6 sm:border-r lg:border-b-0">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

// Tour Side Info

function TourSideInfo({ label, value }) {
  if (!value) return null;

  return (
    <div className="mb-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
