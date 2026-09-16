import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";

import Link from "next/link";

import BreadcrumbJsonLd from "@/app/components/BreadcrumbJsonLd";

import FeedbackList from "@/app/components/FeedbackList";
import FeedbackForm from "@/app/components/FeedbackForm";


/*
=========================================
GET TOUR
=========================================
*/

async function getTour(slug) {

  await connectDB();

  const tourType =
    await PageType.findOne({
      slug: "tour",
      published: true,
    }).lean();


  if (!tourType) {
    return null;
  }


  const tour =
    await Page.findOne({
      slug: slug.toLowerCase(),
      pageType: tourType._id,
      published: true,
    })
      .populate("pageType")
      .populate("region")
      .lean();


  return tour;
}


/*
=========================================
SEO
=========================================
*/

export async function generateMetadata({
  params,
}) {

  const { slug } = await params;

  const tour =
    await getTour(slug);


  if (!tour) {

    return {
      title: "Tour Not Found",
      description:
        "The requested tour could not be found.",
    };
  }


  const title =
    tour.seo?.metaTitle ||
    tour.title;


  const description =
    tour.seo?.metaDescription ||
    tour.description ||
    `${tour.title} in Nepal`;


  return {

    title,

    description,

    keywords:
      tour.seo?.keywords || [],

    alternates:
      tour.seo?.canonicalUrl
        ? {
          canonical:
            tour.seo.canonicalUrl,
        }
        : undefined,

    robots:
      tour.seo?.noIndex
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
        tour.seo?.ogTitle ||
        title,

      description:
        tour.seo?.ogDescription ||
        description,

      images:
        tour.seo?.ogImage
          ? [tour.seo.ogImage]
          : tour.imageUrl
            ? [tour.imageUrl]
            : [],
    },
  };
}


/*
=========================================
PAGE
=========================================
*/

export default async function TourDetailPage({
  params,
}) {

  const { slug } = await params;

  const tour =
    await getTour(slug);


  if (!tour) {
    notFound();
  }


  /*
  ========================================
  BOOKING STATUS
  ========================================
  */

  const isBookable =
    tour.pageType?.bookable === true;


  /*
  ========================================
  TOUR DETAILS
  ========================================
  */

  const details =
    tour.tourDetails || {};


  /*
  ========================================
  PRICE
  ========================================
  */

  const pricingType =
    tour.price?.pricingType || "fixed";


  const fixedPrice =
    Number(tour.price?.amount || 0);


  const paxPrices =
    Array.isArray(tour.price?.paxPrices)
      ? tour.price.paxPrices
      : [];


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
      name: "Tours",
      url: "/tours",
    },

    {
      name: tour.title,
      url: `/tours/${tour.slug}`,
    },

  ];


  return (

    <>

      <BreadcrumbJsonLd
        items={breadcrumbs}
      />


      <main>


        {/* =====================================
            HERO
        ===================================== */}

        <section className="relative bg-gray-900">

          {tour.imageUrl ? (

            <img
              src={tour.imageUrl}
              alt={tour.title}
              className="h-[420px] w-full object-cover opacity-70"
            />

          ) : (

            <div className="h-[420px] bg-gray-800" />

          )}


          <div className="absolute inset-0 bg-black/40" />


          <div className="absolute inset-0 flex items-end">

            <div className="mx-auto w-full max-w-7xl px-6 pb-12">

              <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur">

                Tour

              </span>


              <h1 className="mt-5 text-4xl font-bold text-white md:text-6xl">

                {tour.title}

              </h1>


              {tour.description && (

                <p className="mt-5 max-w-3xl text-lg text-white/90">

                  {tour.description}

                </p>

              )}

            </div>

          </div>

        </section>


        {/* =====================================
            CONTENT
        ===================================== */}

        <section className="mx-auto max-w-7xl px-6 py-12">

          <div className="grid gap-10 lg:grid-cols-3">


            {/* =================================
                LEFT
            ================================= */}

            <div className="lg:col-span-2">


              {/* ================================
                  TOUR INFORMATION
              ================================= */}

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

                <InfoCard
                  label="Duration"
                  value={details.duration}
                />

                <InfoCard
                  label="Tour Type"
                  value={details.tourType}
                />

                <InfoCard
                  label="Destination"
                  value={details.destination}
                />

                <InfoCard
                  label="Best Season"
                  value={details.bestSeason}
                />

                <InfoCard
                  label="Group Size"
                  value={details.groupSize}
                />

                <InfoCard
                  label="Accommodation"
                  value={details.accommodation}
                />

              </div>


              {/* ================================
                  CONTENT
              ================================= */}

              {tour.content && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold">

                    About {tour.title}

                  </h2>


                  <div className="whitespace-pre-line leading-8 text-gray-700">

                    {tour.content}

                  </div>

                </section>

              )}


              {/* ================================
                  TRANSPORTATION
              ================================= */}

              {details.transportation && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold">

                    Transportation

                  </h2>


                  <p className="leading-8 text-gray-700">

                    {details.transportation}

                  </p>

                </section>

              )}


              {/* ================================
                  ITINERARY
              ================================= */}

              {tour.itinerary?.length > 0 && (

                <section className="mt-12">

                  <h2 className="mb-6 text-3xl font-bold">

                    Itinerary

                  </h2>


                  <div className="space-y-5">

                    {tour.itinerary.map(
                      (day, index) => (

                        <div
                          key={index}
                          className="rounded-xl border p-6 shadow-sm"
                        >

                          <div className="flex gap-5">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold text-white">

                              {day.day}

                            </div>


                            <div>

                              <h3 className="text-xl font-bold">

                                {day.title}

                              </h3>


                              {day.description && (

                                <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">

                                  {day.description}

                                </p>

                              )}

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

              {tour.inclusions?.length > 0 && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold">

                    What's Included

                  </h2>


                  <ul className="space-y-3">

                    {tour.inclusions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className="flex gap-3"
                        >

                          <span className="font-bold text-green-600">
                            ✓
                          </span>

                          {item}

                        </li>

                      )
                    )}

                  </ul>

                </section>

              )}


              {/* ================================
                  EXCLUSIONS
              ================================= */}

              {tour.exclusions?.length > 0 && (

                <section className="mt-12">

                  <h2 className="mb-5 text-3xl font-bold">

                    What's Not Included

                  </h2>


                  <ul className="space-y-3">

                    {tour.exclusions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className="flex gap-3"
                        >

                          <span className="font-bold text-red-600">
                            ×
                          </span>

                          {item}

                        </li>

                      )
                    )}

                  </ul>

                </section>

              )}


              {/* ================================
                  IMPORTANT INFORMATION
              ================================= */}

              {tour.importantInformation && (

                <section className="mt-12 rounded-xl bg-gray-50 p-6">

                  <h2 className="mb-4 text-2xl font-bold">

                    Important Information

                  </h2>


                  <p className="whitespace-pre-line leading-7 text-gray-700">

                    {tour.importantInformation}

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

                  Pricing

                </h2>


                {pricingType === "fixed" ? (

                  <div className="mt-5">

                    <span className="text-4xl font-bold">

                      {tour.price?.currency || "USD"}{" "}

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

                          </span>


                          <strong>

                            {tour.price?.currency || "USD"}{" "}

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
                    href={`/booking?experienceId=${tour._id}&experienceType=${tour.pageType.slug}`}
                    className="mt-8 block rounded-lg bg-gray-900 px-6 py-4 text-center font-semibold text-white hover:bg-gray-700"
                  >

                    Book This Tour

                  </Link>

                )}



                {/* ================================
                    ENQUIRY
                    ================================= */}

                <Link
                  href={`/enquiry?experienceId=${tour._id}&experienceType=${tour.pageType.slug}`}
                  className={`block rounded-lg border border-gray-900 px-6 py-4 text-center font-semibold text-gray-900 hover:bg-gray-100 ${isBookable
                      ? "mt-3"
                      : "mt-8"
                    }`}
                >

                  Make an Enquiry

                </Link>

              </div>

            </aside>

          </div>


          {/* =====================================
              FEEDBACK / COMMENTS
          ===================================== */}

          <section className="mx-auto mt-16 max-w-5xl">

            <FeedbackList
              pageId={String(tour._id)}
            />

            <FeedbackForm
              pageId={String(tour._id)}
              pageTitle={tour.title}
            />

          </section>


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


      <p className="mt-2 font-semibold">

        {value}

      </p>

    </div>

  );
}

