
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Page from "@/models/Page";
import Booking from "@/models/Booking";
import PageType from "@/models/PageType";

import { Resend } from "resend";

import { verifyAdminToken } from "@/lib/auth";


/*
=========================================
RESEND
=========================================
*/

const resend = new Resend(
  process.env.RESEND_API_KEY
);


/*
=========================================
GET PAX PRICE
=========================================
*/

function getPaxPrice(
  paxPrices = [],
  numberOfPeople
) {

  if (!Array.isArray(paxPrices)) {
    return null;
  }

  return (
    paxPrices.find((tier) => {

      const min =
        Number(tier.minPax);

      const max =
        tier.maxPax === null ||
        tier.maxPax === "" ||
        typeof tier.maxPax === "undefined"
          ? null
          : Number(tier.maxPax);


      if (
        !Number.isFinite(min) ||
        min < 1
      ) {
        return false;
      }


      if (numberOfPeople < min) {
        return false;
      }


      if (
        max !== null &&
        Number.isFinite(max) &&
        numberOfPeople > max
      ) {
        return false;
      }


      return true;

    }) || null
  );
}


/*
=========================================
HTML ESCAPE
=========================================
*/

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/*
=========================================
POST BOOKING
=========================================

PUBLIC API

Customer can submit a booking without
admin authentication.

Only Page Types where:

bookable === true

can create bookings.
=========================================
*/

export async function POST(request) {

  try {

    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();


    /*
    ========================================
    READ REQUEST BODY
    ========================================
    */

    const body =
      await request.json();


    /*
    ========================================
    CUSTOMER / EXPERIENCE DATA
    ========================================
    */

    const {
      experienceId,
      experienceType,

      name,
      email,
      phone,
      country,

      numberOfPeople,
      preferredDate,
      message,

    } = body;


    /*
    ========================================
    BASIC EXPERIENCE VALIDATION
    ========================================
    */

    if (!experienceId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Experience information is required.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    EXPERIENCE TYPE VALIDATION
    ========================================
    */

    if (
      !experienceType ||
      typeof experienceType !== "string"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Experience type is required.",
        },
        {
          status: 400,
        }
      );
    }


    const requestedExperienceType =
      experienceType
        .trim()
        .toLowerCase();


    /*
    ========================================
    CUSTOMER VALIDATION
    ========================================
    */

    if (!name?.trim()) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Name is required.",
        },
        {
          status: 400,
        }
      );
    }


    if (!email?.trim()) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Email is required.",
        },
        {
          status: 400,
        }
      );
    }


    if (!phone?.trim()) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Phone number is required.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    NUMBER OF PEOPLE
    ========================================
    */

    const people =
      Number(numberOfPeople);


    if (
      !Number.isInteger(people) ||
      people < 1
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Number of people must be at least 1.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    FIND PAGE TYPE
    ========================================

    PageType can be identified by:

    - slug
    - MongoDB ObjectId
    ========================================
    */

    let pageType = null;


    /*
    Try slug first.
    */

    pageType =
      await PageType.findOne({
        slug:
          requestedExperienceType,
      }).lean();


    /*
    If slug was not found,
    try ObjectId.
    */

    if (
      !pageType &&
      /^[0-9a-fA-F]{24}$/.test(
        requestedExperienceType
      )
    ) {

      pageType =
        await PageType.findById(
          requestedExperienceType
        ).lean();
    }


    /*
    ========================================
    PAGE TYPE NOT FOUND
    ========================================
    */

    if (!pageType) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid experience type.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    CHECK PAGE TYPE BOOKABLE
    ========================================

    IMPORTANT:

    This is the server-side protection.

    Even if someone manually calls:

    POST /api/bookings

    they cannot create a booking for
    a Page Type where:

    bookable === false
    ========================================
    */

    if (
      pageType.bookable === false
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "This type of experience is not available for booking.",
        },
        {
          status: 403,
        }
      );
    }


    /*
    ========================================
    FIND EXPERIENCE
    ========================================

    Page.pageType is an ObjectId reference,
    so we use pageType._id here.

    We require published: true.

    We populate:

    name
    slug
    bookable
    ========================================
    */

    const experience =
      await Page.findOne({

        _id:
          experienceId,

        pageType:
          pageType._id,

        published:
          true,

      })
        .populate(
          "pageType",
          "name slug bookable"
        )
        .lean();


    /*
    ========================================
    EXPERIENCE NOT FOUND
    ========================================
    */

    if (!experience) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Experience not found or is not published.",
        },
        {
          status: 404,
        }
      );
    }


    /*
    ========================================
    VERIFY ACTUAL PAGE TYPE
    ========================================

    Prevents:

    experienceId = Trek ID
    experienceType = climbing

    The actual Page Type must match.
    ========================================
    */

    const actualExperienceType =
      experience.pageType?.slug
        ?.trim()
        .toLowerCase();


    if (
      !actualExperienceType ||
      actualExperienceType !==
        requestedExperienceType
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Experience type does not match the selected experience.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    SECOND BOOKABLE CHECK
    ========================================

    Verify the populated Page Type too.

    This protects against inconsistent data.
    ========================================
    */

    if (
      experience.pageType?.bookable === false
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "This type of experience is not available for booking.",
        },
        {
          status: 403,
        }
      );
    }


    /*
    ========================================
    GET PRICE
    ========================================
    */

    const price =
      experience.price || {};


    const currency =
      price.currency || "USD";


    const pricingType =
      price.pricingType || "fixed";


    let packagePrice = 0;

    let estimatedTotal = 0;

    let packagePriceType =
      pricingType;


    /*
    ========================================
    FIXED PRICE
    ========================================
    */

    if (
      pricingType === "fixed"
    ) {

      packagePrice =
        Number(
          price.amount || 0
        );


      /*
      Fixed price is treated as
      price per person.
      */

      estimatedTotal =
        packagePrice * people;


      packagePriceType =
        "fixed";
    }


    /*
    ========================================
    PAX-BASED PRICE
    ========================================
    */

    else if (
      pricingType === "pax_based"
    ) {

      const tier =
        getPaxPrice(
          price.paxPrices,
          people
        );


      /*
      No matching PAX tier.
      */

      if (!tier) {

        return NextResponse.json(
          {
            success: false,
            message:
              `No pricing tier is available for ${people} ${
                people === 1
                  ? "person"
                  : "people"
              }.`,
          },
          {
            status: 400,
          }
        );
      }


      /*
      Price per person.
      */

      packagePrice =
        Number(
          tier.pricePerPax || 0
        );


      /*
      Total price.
      */

      estimatedTotal =
        packagePrice * people;


      packagePriceType =
        "pax_based";
    }


    /*
    ========================================
    INVALID PRICING TYPE
    ========================================
    */

    else {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid pricing configuration.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    VALIDATE PRICE
    ========================================
    */

    if (
      !Number.isFinite(packagePrice) ||
      packagePrice <= 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "This experience does not have a valid price.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !Number.isFinite(estimatedTotal) ||
      estimatedTotal <= 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to calculate booking total.",
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    CREATE BOOKING
    ========================================
    */

    const booking =
      await Booking.create({

        /*
        Experience
        */

        experience:
          experience._id,


        /*
        Dynamic Page Type snapshot.
        */

        experienceType:
          actualExperienceType,

        experienceTitle:
          experience.title,


        /*
        Price snapshot
        */

        packagePrice,

        packageCurrency:
          currency,

        packagePriceType,

        estimatedTotal,


        /*
        Customer information
        */

        name:
          name.trim(),

        email:
          email.trim().toLowerCase(),

        phone:
          phone.trim(),

        country:
          country?.trim() || "",

        numberOfPeople:
          people,

        preferredDate:
          preferredDate?.trim() || "",

        message:
          message?.trim() || "",


        /*
        Initial status
        */

        status:
          "pending",
      });


    /*
    ========================================
    SEND EMAIL
    ========================================
    */

    let emailSent = false;

    let emailError = null;


    try {

      const bookingEmail =
        process.env.BOOKING_EMAIL;


      /*
      Only attempt email when
      BOOKING_EMAIL is configured.
      */

      if (bookingEmail) {

        const emailResult =
          await resend.emails.send({

            from:
              process.env.RESEND_FROM_EMAIL ||
              "Booking <onboarding@resend.dev>",

            to: [
              bookingEmail,
            ],

            subject:
              `New ${actualExperienceType} Booking - ${experience.title}`,

            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  max-width: 700px;
                  margin: auto;
                "
              >

                <h2>
                  New Booking Received
                </h2>

                <hr />

                <h3>
                  Experience
                </h3>

                <p>
                  <strong>Type:</strong>
                  ${escapeHtml(
                    actualExperienceType
                  )}
                </p>

                <p>
                  <strong>Title:</strong>
                  ${escapeHtml(
                    experience.title
                  )}
                </p>

                <h3>
                  Customer Information
                </h3>

                <p>
                  <strong>Name:</strong>
                  ${escapeHtml(name)}
                </p>

                <p>
                  <strong>Email:</strong>
                  ${escapeHtml(email)}
                </p>

                <p>
                  <strong>Phone:</strong>
                  ${escapeHtml(phone)}
                </p>

                <p>
                  <strong>Country:</strong>
                  ${escapeHtml(
                    country ||
                    "Not provided"
                  )}
                </p>

                <h3>
                  Booking Information
                </h3>

                <p>
                  <strong>Number of People:</strong>
                  ${people}
                </p>

                <p>
                  <strong>Preferred Date:</strong>
                  ${escapeHtml(
                    preferredDate ||
                    "Not provided"
                  )}
                </p>

                <h3>
                  Price
                </h3>

                <p>
                  <strong>Pricing Type:</strong>
                  ${escapeHtml(
                    packagePriceType
                  )}
                </p>

                <p>
                  <strong>Price Per Person:</strong>
                  ${escapeHtml(currency)}
                  ${packagePrice}
                </p>

                <p>
                  <strong>Estimated Total:</strong>
                  ${escapeHtml(currency)}
                  ${estimatedTotal}
                </p>

                <h3>
                  Customer Message
                </h3>

                <p>
                  ${escapeHtml(
                    message ||
                    "No message provided."
                  )}
                </p>

                <hr />

                <p>
                  <strong>Booking ID:</strong>
                  ${booking._id}
                </p>

                <p>
                  <strong>Status:</strong>
                  Pending
                </p>

              </div>
            `,
          });


        /*
        ========================================
        CHECK RESEND ERROR
        ========================================
        */

        if (emailResult?.error) {

          emailError =
            emailResult.error.message ||
            "Email sending failed.";

        } else {

          emailSent = true;
        }

      } else {

        emailError =
          "BOOKING_EMAIL is not configured.";
      }

    } catch (error) {

      console.error(
        "Booking email error:",
        error
      );

      emailError =
        error.message ||
        "Email sending failed.";
    }


    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Booking submitted successfully.",

        data: {

          id:
            booking._id,

          experienceTitle:
            experience.title,

          experienceType:
            actualExperienceType,

          packagePrice,

          packageCurrency:
            currency,

          packagePriceType,

          numberOfPeople:
            people,

          estimatedTotal,

          status:
            booking.status,

          emailSent,

          emailError,
        },
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "POST /api/bookings error:",
      error
    );


    /*
    ========================================
    MONGOOSE VALIDATION ERROR
    ========================================
    */

    if (
      error.name ===
      "ValidationError"
    ) {

      return NextResponse.json(
        {
          success: false,

          message:
            "Booking validation failed.",

          errors:
            Object.fromEntries(
              Object.entries(
                error.errors
              ).map(
                ([key, value]) => [
                  key,
                  value.message,
                ]
              )
            ),
        },
        {
          status: 400,
        }
      );
    }


    /*
    ========================================
    GENERAL ERROR
    ========================================
    */

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to create booking.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}


/*
=========================================
GET BOOKINGS
=========================================

ADMIN ONLY

GET /api/bookings
=========================================
*/

export async function GET(request) {

  try {

    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();


    /*
    ========================================
    GET ADMIN TOKEN
    ========================================
    */

    const token =
      request.cookies.get(
        "admin_token"
      )?.value;


    /*
    ========================================
    VERIFY ADMIN
    ========================================
    */

    const admin =
      verifyAdminToken(token);


    if (!admin) {

      return NextResponse.json(
        {
          success: false,

          message:
            "Unauthorized. Admin access required.",
        },
        {
          status: 401,
        }
      );
    }


    /*
    ========================================
    GET BOOKINGS
    ========================================
    */

    const bookings =
      await Booking.find()
        .populate(
          {
            path: "experience",
            select:
              "title slug pageType imageUrl price",
            populate: {
              path: "pageType",
              select:
                "name slug bookable",
            },
          }
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json(
      {
        success: true,

        count:
          bookings.length,

        data:
          bookings,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "GET /api/bookings error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to fetch bookings.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}
