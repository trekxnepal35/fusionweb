import Link from "next/link";

export const metadata = {
title: "About Us | Trek Nepal",
description:
"Learn more about Trek Nepal, our team, and our commitment to creating memorable trekking, touring, climbing, and adventure experiences in Nepal.",
};

export default function AboutPage() {
return ( <main className="bg-white">


  {/* ========================================
      HERO
  ======================================== */}

  <section className="relative overflow-hidden bg-gray-900">
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

    <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-10 lg:px-16 lg:py-32">

      <div className="max-w-3xl">

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
          About Us
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Discover Nepal With Us
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-200">
          We create unforgettable experiences across Nepal, from
          Himalayan treks and cultural tours to climbing and adventure
          journeys.
        </p>

      </div>

    </div>
  </section>


  {/* ========================================
      INTRODUCTION
  ======================================== */}

  <section className="mx-auto max-w-7xl px-5 py-16 sm:px-10 lg:px-16 lg:py-24">

    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

      <div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Who We Are
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Your Journey Begins Here
        </h2>

        <div className="mt-6 space-y-5 text-base leading-7 text-gray-600">

          <p >
            Nepal is a country of extraordinary landscapes, rich
            cultures, ancient traditions, and some of the world's most
            spectacular mountains. Our goal is to help travelers
            experience the best of Nepal in a safe, comfortable, and
            meaningful way.
          </p>

          <p>
            From classic Himalayan trekking routes to cultural
            destinations, mountain climbing, and adventure experiences,
            we provide carefully organized journeys designed for
            travelers from around the world.
          </p>

          <p>
            We believe that traveling through Nepal is more than simply
            visiting a destination. It is an opportunity to connect with
            local communities, experience different cultures, and create
            memories that last a lifetime.
          </p>

        </div>

      </div>


      {/* IMAGE PLACEHOLDER */}

      <div className="overflow-hidden rounded-3xl bg-gray-100 shadow-lg">

        <div className="flex aspect-[4/3] items-center justify-center">

          <div className="text-center">

            <p className="text-lg font-semibold text-gray-400">
              Nepal Himalayas
            </p>

            <p className="mt-2 text-sm text-gray-400">
              <img src="./AboutImage.png" alt="About Photo" />
            </p>

          </div>

        </div>

      </div>

    </div>

  </section>


  {/* ========================================
      WHAT WE OFFER
  ======================================== */}

  <section className="bg-gray-50">

    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-10 lg:px-16 lg:py-24">

      <div className="mx-auto max-w-3xl text-center">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          What We Offer
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Explore Nepal Your Way
        </h2>

        <p className="mt-5 text-lg leading-8 text-gray-600">
          Choose from a range of experiences and discover Nepal according
          to your interests, time, and adventure level.
        </p>

      </div>


      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">


        {/* TREKS */}

        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
            🏔️
          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-900">
            Trekking
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Experience the Himalayas through some of Nepal's most
            beautiful trekking routes.
          </p>

        </div>


        {/* TOURS */}

        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
            🛕
          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-900">
            Tours
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Discover Nepal's cultural heritage, historic cities,
            temples, wildlife, and natural beauty.
          </p>

        </div>


        {/* CLIMBING */}

        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
            🧗
          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-900">
            Climbing
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Take on Himalayan peaks and experience the challenge of
            climbing in Nepal.
          </p>

        </div>


        {/* ADVENTURE */}

        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
            🪂
          </div>

          <h3 className="mt-5 text-xl font-bold text-gray-900">
            Adventure
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Add excitement to your Nepal journey with unforgettable
            adventure activities and experiences.
          </p>

        </div>

      </div>

    </div>

  </section>


  {/* ========================================
      WHY TRAVEL WITH US
  ======================================== */}

  <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">

    <div className="grid gap-12 lg:grid-cols-2">

      <div>

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Why Choose Us
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          More Than Just a Trip
        </h2>

        <p className="mt-5 text-base leading-7 text-gray-600">
          We focus on creating journeys that combine adventure,
          responsible travel, local experiences, and professional
          organization.
        </p>

      </div>


      <div className="grid gap-6 sm:grid-cols-2">

        <div className="rounded-2xl border border-gray-200 p-6">

          <h3 className="text-lg font-bold text-gray-900">
            Local Experience
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Discover Nepal through people who understand its mountains,
            culture, communities, and destinations.
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 p-6">

          <h3 className="text-lg font-bold text-gray-900">
            Personalized Journeys
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            We can help travelers find experiences that match their
            interests, schedule, and travel goals.
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 p-6">

          <h3 className="text-lg font-bold text-gray-900">
            Responsible Travel
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            We value Nepal's natural environment, local communities,
            culture, and heritage.
          </p>

        </div>


        <div className="rounded-2xl border border-gray-200 p-6">

          <h3 className="text-lg font-bold text-gray-900">
            Memorable Experiences
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Our aim is to make every journey meaningful and memorable,
            from the first day to the final farewell.
          </p>

        </div>

      </div>

    </div>

  </section>


  {/* ========================================
      CTA
  ======================================== */}

  <section className="bg-gray-900">

    <div className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-12 lg:py-20">

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Ready to Explore Nepal?
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
        Explore our trekking, tour, climbing, and adventure experiences
        and start planning your journey.
      </p>


      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

        <Link
          href="/treks"
          className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
        >
          Explore Treks
        </Link>

        <Link
          href="/tours"
          className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Explore Tours
        </Link>

        <Link
          href="/contact"
          className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Contact Us
        </Link>

      </div>

    </div>

  </section>

</main>


);
}
