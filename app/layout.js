import "./globals.css";

import Navbar from "./components/Navbar";
import { getMenus } from "@/lib/getMenus";


/*
=========================================
WEBSITE METADATA
=========================================
*/

export const metadata = {

  title: {
    default:
      "Trek Nepal | Himalayan Treks & Tours",
    template:
      "%s | Trek Nepal",
  },


  description:
    "Discover unforgettable trekking adventures, cultural tours and Himalayan experiences across Nepal.",


  keywords: [
    "Nepal trekking",
    "Nepal tours",
    "Everest Base Camp Trek",
    "Annapurna Trek",
    "Langtang Trek",
    "Manaslu Trek",
    "Kangchenjunga Trek",
    "Himalayan trekking",
    "Nepal travel",
    "Nepal adventure",
  ],


  authors: [
    {
      name: "Trek Nepal",
    },
  ],


  creator:
    "Trek Nepal",


  publisher:
    "Trek Nepal",


  metadataBase:
    new URL(
      process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000"
    ),


  alternates: {
    canonical: "/",
  },


  openGraph: {

    type: "website",

    locale: "en_US",

    siteName:
      "Trek Nepal",

    title:
      "Trek Nepal | Himalayan Treks & Tours",

    description:
      "Explore Nepal's Himalayas through unforgettable treks, tours and authentic travel experiences.",

    url: "/",
  },


  twitter: {

    card:
      "summary_large_image",

    title:
      "Trek Nepal | Himalayan Treks & Tours",

    description:
      "Discover unforgettable adventures across Nepal's Himalayas.",
  },


  robots: {

    index: true,

    follow: true,

    googleBot: {

      index: true,

      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};


/*
=========================================
ROOT LAYOUT
=========================================
*/

export default async function RootLayout({
  children,
}) {
  const menus = await getMenus();

  return (

    <html lang="en">

      <body className="min-h-screen bg-white text-slate-900 antialiased">

        {/* =================================
            NAVBAR
        ================================= */}

        <Navbar menus={menus} />
        <div className="h-20" />

        {/* =================================
            MAIN CONTENT
        ================================= */}

        <main className="min-h-screen ">

          {children}

        </main>


        {/* =================================
            FOOTER
        ================================= */}

        <footer className="bg-slate-950 text-white">

          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">


              {/* BRAND */}

              <div className="lg:col-span-2">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-xl">
                    🏔️
                  </div>


                  <div>

                    <div className="text-xl font-black">
                      Trek Nepal
                    </div>

                    <div className="text-xs text-slate-400">
                      Himalayan Adventures
                    </div>

                  </div>

                </div>


                <p className="mt-6 max-w-md leading-7 text-slate-400">

                  Discover the mountains, culture and
                  extraordinary landscapes of Nepal through
                  unforgettable trekking and travel experiences.

                </p>


                <div className="mt-7 flex gap-3">

                  <SocialLink
                    label="f"
                    href="#"
                  />

                  <SocialLink
                    label="ig"
                    href="#"
                  />

                  <SocialLink
                    label="in"
                    href="#"
                  />

                </div>

              </div>


              {/* EXPLORE */}

              <div>

                <h3 className="font-black">
                  Explore
                </h3>


                <ul className="mt-5 space-y-3 text-sm text-slate-400">

                  <li>
                    <a
                      href="/treks"
                      className="transition hover:text-white"
                    >
                      Treks
                    </a>
                  </li>


                  <li>
                    <a
                      href="/tours"
                      className="transition hover:text-white"
                    >
                      Tours
                    </a>
                  </li>


                  <li>
                    <a
                      href="/booking"
                      className="transition hover:text-white"
                    >
                      Booking
                    </a>
                  </li>

                </ul>

              </div>


              {/* CONTACT */}

              <div>

                <h3 className="font-black">
                  Contact
                </h3>


                <ul className="mt-5 space-y-4 text-sm text-slate-400">

                  <li>
                    📍 Kathmandu, Nepal
                  </li>


                  <li>
                    ✉️ abc@gmail.com
                  </li>


                  <li>
                    📞 +977 98XXXXXXXX
                  </li>

                </ul>

              </div>

            </div>


            {/* FOOTER BOTTOM */}

            <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

              <p>
                © {new Date().getFullYear()} Trek Nepal.
                All rights reserved.
              </p>


              <div className="flex gap-6">

                <a
                  href="#"
                  className="transition hover:text-white"
                >
                  Privacy Policy
                </a>


                <a
                  href="#"
                  className="transition hover:text-white"
                >
                  Terms
                </a>

              </div>

            </div>

          </div>

        </footer>


        {/* =================================
            ORGANIZATION JSON-LD
        ================================= */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({

              "@context":
                "https://schema.org",

              "@type":
                "TravelAgency",

              name:
                "Trek Nepal",

              description:
                "Nepal trekking and tour company offering Himalayan adventures and travel experiences.",

              url:
                process.env.NEXT_PUBLIC_SITE_URL ||
                "http://localhost:3000",

              address: {

                "@type":
                  "PostalAddress",

                addressLocality:
                  "Kathmandu",

                addressCountry:
                  "NP",
              },

            }),
          }}
        />

      </body>

    </html>
  );
}


/*
=========================================
SOCIAL LINK
=========================================
*/

function SocialLink({
  label,
  href,
}) {

  return (

    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold uppercase transition hover:bg-emerald-500"
    >

      {label}

    </a>

  );
}