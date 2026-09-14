import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";
import { verifyAdminToken } from "@/lib/auth";


function getAdminFromRequest(request) {

  const token =
    request.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}


/*
========================================
GET SINGLE PAGE
========================================
*/

export async function GET(
  request,
  { params }
) {

  try {

    await connectDB();

    const { id } = await params;

    const page = await Page.findById(id)
      .populate("pageType")
      .populate("region")
      .lean();

    if (!page) {

      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });

  } catch (error) {

    console.error("GET page error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}


/*
========================================
PUT UPDATE PAGE
========================================
*/

export async function PUT(
  request,
  { params }
) {

  try {

    /*
    ========================================
    ADMIN AUTHORIZATION
    ========================================
    */

    const admin = getAdminFromRequest(request);

    if (!admin) {

      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const body = await request.json();

    /*
    ========================================
    FIND EXISTING PAGE
    ========================================
    */

    const existingPage =
      await Page.findById(id);

    if (!existingPage) {

      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    /*
    ========================================
    BASIC VALIDATION
    ========================================
    */

    if (!body.title) {

      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 }
      );
    }

    if (!body.slug) {

      return NextResponse.json(
        {
          success: false,
          message: "Slug is required",
        },
        { status: 400 }
      );
    }

    if (!body.pageType) {

      return NextResponse.json(
        {
          success: false,
          message: "Page type is required",
        },
        { status: 400 }
      );
    }

    /*
    ========================================
    PAGE TYPE
    ========================================
    */

    const pageType =
      await PageType.findOne({
        $or: [
          { _id: body.pageType },
          {
            slug:
              String(body.pageType)
                .toLowerCase(),
          },
        ],
      });

    if (!pageType) {

      return NextResponse.json(
        {
          success: false,
          message: "Invalid page type",
        },
        { status: 400 }
      );
    }

    /*
    ========================================
    SLUG
    ========================================
    */

    const slug =
      String(body.slug)
        .trim()
        .toLowerCase();

    const duplicate =
      await Page.findOne({
        slug,
        _id: { $ne: id },
      });

    if (duplicate) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Another page already uses this slug",
        },
        { status: 409 }
      );
    }

    /*
    ========================================
    REGION
    ========================================
    */

    let regionId = null;

    if (body.region) {

      const region =
        await Region.findOne({
          $or: [
            { _id: body.region },
            {
              slug:
                String(body.region)
                  .toLowerCase(),
            },
          ],
        });

      if (!region) {

        return NextResponse.json(
          {
            success: false,
            message: "Invalid region",
          },
          { status: 400 }
        );
      }

      regionId = region._id;
    }

    /*
    ========================================
    PRICE
    ========================================
    */

    const pricingType =
      body.price?.pricingType === "pax_based"
        ? "pax_based"
        : "fixed";

    let paxPrices = [];

    if (pricingType === "pax_based") {

      if (
        !Array.isArray(
          body.price?.paxPrices
        )
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "PAX pricing tiers are required",
          },
          { status: 400 }
        );
      }

      paxPrices =
        body.price.paxPrices.map(
          (tier) => ({
            minPax:
              Number(tier.minPax),

            maxPax:
              tier.maxPax === "" ||
              tier.maxPax === null ||
              tier.maxPax === undefined
                ? null
                : Number(tier.maxPax),

            pricePerPax:
              Number(tier.pricePerPax),
          })
        );
    }

    /*
    ========================================
    UPDATE
    ========================================
    */

    existingPage.title =
      body.title;

    existingPage.slug =
      slug;

    existingPage.pageType =
      pageType._id;

    existingPage.region =
      regionId;

    existingPage.imageUrl =
      body.imageUrl || "";

    existingPage.description =
      body.description || "";

    existingPage.content =
      body.content || "";

    existingPage.price = {
      currency:
        body.price?.currency || "USD",

      pricingType,

      amount:
        body.price?.amount === "" ||
        body.price?.amount === undefined
          ? 0
          : Number(body.price.amount),

      paxPrices,
    };

    existingPage.trekDetails =
      body.trekDetails || {};

    existingPage.tourDetails =
      body.tourDetails || {};

    existingPage.itinerary =
      Array.isArray(body.itinerary)
        ? body.itinerary
        : [];

    existingPage.inclusions =
      Array.isArray(body.inclusions)
        ? body.inclusions
        : [];

    existingPage.exclusions =
      Array.isArray(body.exclusions)
        ? body.exclusions
        : [];

    existingPage.importantInformation =
      body.importantInformation || "";

    existingPage.seo =
      body.seo || {};

    existingPage.published =
      body.published === true;

    existingPage.order =
      Number(body.order) || 0;

    await existingPage.save();

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
      data: existingPage,
    });

  } 
  catch (error) {

    console.error("PUT page error:", error);
  
  
    /*
    ========================================
    MONGOOSE VALIDATION ERROR
    ========================================
    */
  
    if (error.name === "ValidationError") {
  
      const messages = Object.values(error.errors)
        .map((item) => item.message);
  
      return NextResponse.json(
        {
          success: false,
          message: messages.join(", "),
        },
        { status: 400 }
      );
    }
  
  
    /*
    ========================================
    DUPLICATE KEY ERROR
    ========================================
    */
  
    if (error.code === 11000) {
  
      return NextResponse.json(
        {
          success: false,
          message:
            "A page with this value already exists.",
        },
        { status: 409 }
      );
    }
  
  
    /*
    ========================================
    OTHER SERVER ERRORS
    ========================================
    */
  
    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Internal server error",
      },
      { status: 500 }
    );
  }
}


/*
========================================
DELETE PAGE
========================================
*/

export async function DELETE(
  request,
  { params }
) {

  try {

    /*
    ========================================
    ADMIN AUTHORIZATION
    ========================================
    */

    const admin = getAdminFromRequest(request);

    if (!admin) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const page =
      await Page.findByIdAndDelete(id);

    if (!page) {

      return NextResponse.json(
        {
          success: false,
          message: "Page not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE page error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}