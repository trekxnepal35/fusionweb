import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";
import { verifyAdminToken } from "@/lib/auth";

function getAdminFromRequest(request) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}

/*
========================================
GET PAGES
========================================
*/

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const pageType = searchParams.get("pageType");
    const region = searchParams.get("region");
    const published = searchParams.get("published");

    /*
    ========================================
    PAGINATION
    ========================================
    */

    const requestedPage = Number(
      searchParams.get("page") || 1
    );

    const requestedLimit = Number(
      searchParams.get("limit") || 10
    );

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0 &&
      requestedLimit <= 100
        ? requestedLimit
        : 10;

    const skip = (page - 1) * limit;

    const filter = {};

    /*
    ================================
    FIND BY ID
    ================================
    */

    if (id) {
      if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid page ID",
          },
          { status: 400 }
        );
      }

      const pageData = await Page.findById(id)
        .populate("pageType")
        .populate("region")
        .lean();

      if (!pageData) {
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
        data: pageData,
      });
    }

    /*
    ================================
    FIND BY SLUG
    ================================
    */

    if (slug) {
      filter.slug = String(slug)
        .trim()
        .toLowerCase();
    }

    /*
    ================================
    PAGE TYPE
    ================================
    */

    if (pageType) {
      let pageTypeDoc = null;

      /*
      --------------------------------
      PAGE TYPE CAN BE:
      - ObjectId
      - Slug such as "blog"
      --------------------------------
      */

      if (mongoose.isValidObjectId(pageType)) {
        pageTypeDoc = await PageType.findById(
          pageType
        ).lean();
      } else {
        pageTypeDoc = await PageType.findOne({
          slug: String(pageType)
            .trim()
            .toLowerCase(),
        }).lean();
      }

      /*
      --------------------------------
      PAGE TYPE NOT FOUND
      --------------------------------
      */

      if (!pageTypeDoc) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: page > 1,
          },
        });
      }

      filter.pageType = pageTypeDoc._id;
    }

    /*
    ================================
    REGION
    ================================
    */

    if (region) {
      let regionDoc = null;

      /*
      --------------------------------
      REGION CAN BE:
      - ObjectId
      - Slug
      --------------------------------
      */

      if (mongoose.isValidObjectId(region)) {
        regionDoc = await Region.findById(
          region
        ).lean();
      } else {
        regionDoc = await Region.findOne({
          slug: String(region)
            .trim()
            .toLowerCase(),
        }).lean();
      }

      /*
      --------------------------------
      REGION NOT FOUND
      --------------------------------
      */

      if (!regionDoc) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: page > 1,
          },
        });
      }

      filter.region = regionDoc._id;
    }

    /*
    ================================
    PUBLISHED
    ================================
    */

    if (published !== null) {
      filter.published = published === "true";
    }

    /*
    ================================
    COUNT TOTAL PAGES
    ================================
    */

    const totalItems = await Page.countDocuments(
      filter
    );

    const totalPages =
      totalItems === 0
        ? 0
        : Math.ceil(totalItems / limit);

    /*
    ================================
    FIND PAGES
    ================================
    */

    const pages = await Page.find(filter)
      .populate("pageType")
      .populate("region")
      .sort({
        order: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /*
    ================================
    PAGINATION INFORMATION
    ================================
    */

    const hasNextPage =
      page < totalPages;

    const hasPrevPage =
      page > 1;

    return NextResponse.json({
      success: true,

      data: pages,

      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });

  } catch (error) {

    console.error(
      "GET /api/pages error:",
      error
    );

    /*
    ========================================
    MONGOOSE VALIDATION ERROR
    ========================================
    */

    if (error.name === "ValidationError") {

      const messages =
        Object.values(error.errors)
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
    CAST ERROR
    ========================================
    */

    if (error.name === "CastError") {

      return NextResponse.json(
        {
          success: false,
          message:
            `Invalid ${
              error.path || "value"
            }: ${error.value}`,
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
POST CREATE PAGE
========================================
*/

export async function POST(request) {

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

    const body = await request.json();

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
    FIND PAGE TYPE
    ========================================
    */

    let pageType = null;

    /*
    --------------------------------
    PAGE TYPE CAN BE:
    - ObjectId
    - Slug such as "blog"
    --------------------------------
    */

    if (
      mongoose.isValidObjectId(
        body.pageType
      )
    ) {

      pageType = await PageType.findById(
        body.pageType
      );

    } else {

      pageType = await PageType.findOne({
        slug: String(body.pageType)
          .trim()
          .toLowerCase(),
      });

    }

    /*
    --------------------------------
    INVALID PAGE TYPE
    --------------------------------
    */

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
    CHECK DUPLICATE SLUG
    ========================================
    */

    const slug = String(body.slug)
      .trim()
      .toLowerCase();

    const existingPage =
      await Page.findOne({
        slug,
      });

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A page with this slug already exists",
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

      let region = null;

      /*
      --------------------------------
      REGION CAN BE:
      - ObjectId
      - Slug
      --------------------------------
      */

      if (
        mongoose.isValidObjectId(
          body.region
        )
      ) {

        region = await Region.findById(
          body.region
        );

      } else {

        region = await Region.findOne({
          slug: String(body.region)
            .trim()
            .toLowerCase(),
        });

      }

      /*
      --------------------------------
      INVALID REGION
      --------------------------------
      */

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
      body.price?.pricingType ===
      "pax_based"
        ? "pax_based"
        : "fixed";

    let paxPrices = [];

    if (
      pricingType === "pax_based"
    ) {

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

    const price = {

      currency:
        body.price?.currency ||
        "USD",

      pricingType,

      amount:
        body.price?.amount === "" ||
        body.price?.amount ===
          undefined
          ? 0
          : Number(
              body.price.amount
            ),

      paxPrices,
    };

    /*
    ========================================
    CREATE PAGE
    ========================================
    */

    const page = await Page.create({

      title: body.title,

      slug,

      pageType:
        pageType._id,

      region:
        regionId,

      imageUrl:
        body.imageUrl || "",

      description:
        body.description || "",

      content:
        body.content || "",

      price,

      trekDetails:
        body.trekDetails || {},

      tourDetails:
        body.tourDetails || {},

      itinerary:
        Array.isArray(
          body.itinerary
        )
          ? body.itinerary
          : [],

      inclusions:
        Array.isArray(
          body.inclusions
        )
          ? body.inclusions
          : [],

      exclusions:
        Array.isArray(
          body.exclusions
        )
          ? body.exclusions
          : [],

      importantInformation:
        body.importantInformation ||
        "",

      seo:
        body.seo || {},

      published:
        body.published === true,

      order:
        Number(body.order) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Page created successfully",
        data: page,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "POST /api/pages error:",
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

      const messages =
        Object.values(
          error.errors
        ).map(
          (item) =>
            item.message
        );

      return NextResponse.json(
        {
          success: false,
          message:
            messages.join(", "),
        },
        { status: 400 }
      );
    }

    /*
    ========================================
    CAST ERROR
    ========================================
    */

    if (
      error.name ===
      "CastError"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            `Invalid ${
              error.path ||
              "value"
            }: ${error.value}`,
        },
        { status: 400 }
      );
    }

    /*
    ========================================
    DUPLICATE KEY ERROR
    ========================================
    */

    if (
      error.code === 11000
    ) {

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