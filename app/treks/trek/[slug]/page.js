import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";

import Link from "next/link";
import TrekJsonLd from "@/app/components/TrekJsonLd";
import BreadcrumbJsonLd from "@/app/components/BreadcrumbJsonLd";


/*
=========================================
GET TREK
=========================================
*/

async function getTrek(slug) {

  await connectDB();

  /*
  ========================================
  FIND TREK PAGE TYPE
  ========================================
  */

  const trekType =
    await PageType.findOne({
      slug: "trek",
      published: true,
    }).lean();


  if (!trekType) {
    return null;
  }


  /*
  ========================================
  FIND TREK
  ========================================
  */

  const trek =
    await Page.findOne({
      slug: slug.toLowerCase(),
      pageType: trekType._id,
      published: true,
    })
      .populate("pageType")
      .populate("region")
      .lean();


  return trek;
}


/*
=========================================
DYNAMIC SEO METADATA
=========================================
*/

export async function generateMetadata({ params }) {

  const { slug } = await params;

  const trek = await getTrek(slug);


  if (!trek) {

    return {
      title: "Trek Not Found",
      description:
        "The requested trek could not be found.",
    };
  }


  const title =
    trek.seo?.metaTitle ||
    trek.title;


  const description =
    trek.seo?.metaDescription ||
    trek.description ||
    `${trek.title} in Nepal`;


  return {

    title,

    description,

    keywords:
      trek.seo?.keywords || [],

    alternates:
      trek.seo?.canonicalUrl
        ? {
            canonical:
              trek.seo.canonicalUrl,
          }
        : undefined,

    robots:
      trek.seo?.noIndex
        ? {
            index: false,
            follow: false,
          }
        : {
            index: true,
            follow: true,
          },

    openGraph: {

      title:
        trek.seo?.ogTitle ||
        title,

      description:
        trek.seo?.ogDescription ||
        description,

      images:
        trek.seo?.ogImage
          ? [trek.seo.ogImage]
          : trek.imageUrl
            ? [trek.imageUrl]
            : [],
    },
  };
}


/*
=========================================
PAGE
=========================================
*/

export default async function TrekDetailPage({
  params,
}) {

  const { slug } = await params;

  const trek =
    await getTrek(slug);


  /*
  ========================================
  404
  ========================================
  */

  if (!trek) {
    notFound();
  }


  /*
  ========================================
  BOOKING STATUS
  ========================================
  */

  const isBookable =
    trek.pageType?.bookable === true;


  /*
  ========================================
  PRICE
  ========================================
  */

  const pricingType =
    trek.price?.pricingType || "fixed";


  const fixedPrice =
    Number(trek.price?.amount || 0);


  const paxPrices =
    Array.isArray(trek.price?.paxPrices)
      ? trek.price.paxPrices
      : [];


  /*
  ========================================
  TREK DETAILS
  ========================================
  */

  const details =
    trek.trekDetails || {};


  /*
  ========================================
  BREADCRUMB
  ========================================
  */

  const breadcrumbs = [

    {
      name: "Home",
      url: "/",
    },

    {
      name: "Treks",
      url: "/treks",
    },

    ...(trek.region
      ? [
          {
            name: trek.region.name,
            url: `/treks/${trek.region.slug}`,
          },
        ]
      : []),

    {
      name: trek.title,
      url: `/treks/trek/${trek.slug}`,
    },
  ];


  return (

    <>

      <TrekJsonLd trek={trek} />

      <BreadcrumbJsonLd
        items={breadcrumbs}
      />


      <main>

        {/* =====================================
            HERO
        ===================================== */}

        <section className="relative bg-gray-900">

          {trek.imageUrl ? (

            <img
              src={trek.imageUrl}
              alt={trek.title}
              className="h-[420px] w-full object-cover opacity-70"
            />

          ) : (

            <div className="h-[420px] bg-gray-800" />

          )}


          <div className="absolute inset-0 bg-black/40" />


          <div className="absolute inset-0 flex items-end">

            <div className="mx-auto w-full max-w-7xl px-6 pb-12">

              <div className="max-w-4xl">

                <div className="mb-4 flex flex-wrap gap-2">

                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur">

                    Trekking

                  </span>


                  {trek.region && (

                    <Link
                      href={`/treks/${trek.region.slug}`}
                      className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/30"
                    >

                      {trek.region.name}

                    </Link>

                  )}

                </div>


                <h1 className="text-4xl font-bold text-white md:text-6xl">

                  {trek.title}

                </h1>


                {trek.description && (

                  <p className="mt-5 max-w-3xl text-lg text-white/90">

                    {trek.description}

                  </p>

                )}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <section className="mx-auto max-w-7xl px-6 py-12">

          <div className="grid gap-10 lg:grid-cols-3">


            {/* =================================
                LEFT CONTENT
            ================================= */}

            <div className="lg:col-span-2">


              {/* ================================
                  QUICK INFORMATION
              ================================= */}

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                <InfoCard
                  label="Duration"
                  value={details.duration}
                />

                <InfoCard
                  label="Difficulty"
                  value={details.difficulty}
                />

                <InfoCard
                  label="Max Altitude"
                  value={details.maxAltitude}
                />

                <InfoCard
                  label="Best Season"
                  value={details.bestSeason}
                />

              </div>


              {/* ================================
                  DESCRIPTION
              ================================= */}

              {trek.content && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold text-gray-900">

                    About {trek.title}

                  </h2>


                  <div className="whitespace-pre-line leading-8 text-gray-700">

                    {trek.content}

                  </div>

                </section>

              )}


              {/* ================================
                  TREK DETAILS
              ================================= */}

              <section className="mt-12">

                <h2 className="mb-6 text-3xl font-bold">

                  Trek Information

                </h2>


                <div className="grid gap-4 md:grid-cols-2">

                  <DetailRow
                    label="Starting Point"
                    value={details.startingPoint}
                  />

                  <DetailRow
                    label="Ending Point"
                    value={details.endingPoint}
                  />

                  <DetailRow
                    label="Accommodation"
                    value={details.accommodation}
                  />

                  <DetailRow
                    label="Meals"
                    value={details.meals}
                  />

                  <DetailRow
                    label="Group Size"
                    value={details.groupSize}
                  />

                  <DetailRow
                    label="Permits"
                    value={details.permits}
                  />

                  <DetailRow
                    label="Transportation"
                    value={details.transportation}
                  />

                  <DetailRow
                    label="Guide"
                    value={details.guide}
                  />

                </div>

              </section>


              {/* ================================
                  ITINERARY
              ================================= */}

              {trek.itinerary?.length > 0 && (

                <section className="mt-12">

                  <h2 className="mb-6 text-3xl font-bold">

                    Itinerary

                  </h2>


                  <div className="space-y-5">

                    {trek.itinerary.map(
                      (day, index) => (

                        <div
                          key={index}
                          className="rounded-xl border bg-white p-6 shadow-sm"
                        >

                          <div className="flex gap-5">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold text-white">

                              {day.day}

                            </div>


                            <div className="flex-1">

                              <h3 className="text-xl font-bold">

                                {day.title}

                              </h3>


                              {day.description && (

                                <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">

                                  {day.description}

                                </p>

                              )}


                              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">

                                {day.altitude && (
                                  <span>
                                    Altitude: {day.altitude}
                                  </span>
                                )}

                                {day.walkingHours && (
                                  <span>
                                    Walking: {day.walkingHours}
                                  </span>
                                )}

                                {day.accommodation && (
                                  <span>
                                    Stay: {day.accommodation}
                                  </span>
                                )}

                                {day.meal && (
                                  <span>
                                    Meal: {day.meal}
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </section>

              )}


              {/* ================================
                  INCLUSIONS
              ================================= */}

              {trek.inclusions?.length > 0 && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold">

                    What's Included

                  </h2>


                  <ul className="space-y-3">

                    {trek.inclusions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className="flex gap-3 text-gray-700"
                        >

                          <span className="font-bold text-green-600">
                            ✓
                          </span>

                          <span>{item}</span>

                        </li>

                      )
                    )}

                  </ul>

                </section>

              )}


              {/* ================================
                  EXCLUSIONS
              ================================= */}

              {trek.exclusions?.length > 0 && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold">

                    What's Not Included

                  </h2>


                  <ul className="space-y-3">

                    {trek.exclusions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className="flex gap-3 text-gray-700"
                        >

                          <span className="font-bold text-red-600">
                            ×
                          </span>

                          <span>{item}</span>

                        </li>

                      )
                    )}

                  </ul>

                </section>

              )}


              {/* ================================
                  IMPORTANT INFORMATION
              ================================= */}

              {trek.importantInformation && (

                <section className="mt-12 rounded-xl bg-gray-50 p-6">

                  <h2 className="mb-4 text-2xl font-bold">

                    Important Information

                  </h2>


                  <p className="whitespace-pre-line leading-7 text-gray-700">

                    {trek.importantInformation}

                  </p>

                </section>

              )}

            </div>


            {/* =================================
                SIDEBAR
            ================================= */}

            <aside>

              <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-lg">

                <h2 className="text-2xl font-bold">

                  {pricingType === "pax_based"
                    ? "Pricing"
                    : "Package Price"}

                </h2>


                {pricingType === "fixed" ? (

                  <div className="mt-5">

                    <span className="text-4xl font-bold">

                      {trek.price?.currency || "USD"}{" "}

                      {fixedPrice.toLocaleString()}

                    </span>

                    <span className="ml-2 text-gray-500">

                      / person

                    </span>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {paxPrices.map(
                      (tier, index) => (

                        <div
                          key={index}
                          className="flex justify-between rounded-lg bg-gray-50 p-3"
                        >

                          <span>

                            {tier.minPax}

                            {" – "}

                            {tier.maxPax ?? "16+"}

                            {" people"}

                          </span>


                          <strong>

                            {trek.price?.currency || "USD"}{" "}

                            {Number(
                              tier.pricePerPax
                            ).toLocaleString()}

                          </strong>

                        </div>

                      )
                    )}

                  </div>

                )}


                {/* ================================
                    BOOKING
                ================================= */}

                {isBookable && (

                  <Link
                    href={`/booking?experienceId=${trek._id}&experienceType=${trek.pageType.slug}`}
                    className="mt-8 block rounded-lg bg-gray-900 px-6 py-4 text-center font-semibold text-white transition hover:bg-gray-700"
                  >

                    Book This Trek

                  </Link>

                )}


                {/* ================================
                    ENQUIRY
                ================================= */}

                <Link
                  href={`/enquiry?experienceId=${trek._id}&experienceType=${trek.pageType.slug}`}
                  className={`block rounded-lg border border-gray-900 px-6 py-4 text-center font-semibold text-gray-900 transition hover:bg-gray-100 ${
                    isBookable
                      ? "mt-3"
                      : "mt-8"
                  }`}
                >

                  Make an Enquiry

                </Link>


                <p className="mt-5 text-center text-sm text-gray-500">

                  Contact us for availability and
                  personalized trekking arrangements.

                </p>

              </div>

            </aside>

          </div>

        </section>

      </main>

    </>
  );
}


/*
=========================================
INFO CARD
=========================================
*/

function InfoCard({
  label,
  value,
}) {

  if (!value) {
    return null;
  }


  return (

    <div className="rounded-xl bg-gray-50 p-5">

      <p className="text-sm text-gray-500">

        {label}

      </p>


      <p className="mt-2 font-semibold text-gray-900">

        {value}

      </p>

    </div>

  );
}


/*
=========================================
DETAIL ROW
=========================================
*/

function DetailRow({
  label,
  value,
}) {

  if (!value) {
    return null;
  }


  return (

    <div className="rounded-lg border p-4">

      <p className="text-sm text-gray-500">

        {label}

      </p>


      <p className="mt-1 font-medium">

        {value}

      </p>

    </div>

  );
}