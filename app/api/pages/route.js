import { NextResponse } from "next/server";
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

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const pageType = searchParams.get("pageType");
    const region = searchParams.get("region");
    const published = searchParams.get("published");

    const filter = {};

    /*
    ================================
    FIND BY ID
    ================================
    */

    if (id) {
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
    }

    /*
    ================================
    FIND BY SLUG
    ================================
    */

    if (slug) {
      filter.slug = slug.toLowerCase();
    }

    /*
    ================================
    PAGE TYPE
    ================================
    */

    if (pageType) {
      const pageTypeDoc = await PageType.findOne({
        $or: [
          { _id: pageType },
          { slug: pageType.toLowerCase() },
        ],
      }).lean();

      if (!pageTypeDoc) {
        return NextResponse.json({
          success: true,
          data: [],
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
      const regionDoc = await Region.findOne({
        $or: [
          { _id: region },
          { slug: region.toLowerCase() },
        ],
      }).lean();

      if (!regionDoc) {
        return NextResponse.json({
          success: true,
          data: [],
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

    const pages = await Page.find(filter)
      .populate("pageType")
      .populate("region")
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: pages,
    });

  }catch (error) {

    console.error("POST /api/pages error:", error);
  
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
          message: "Unauthorized. Admin login required.",
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

    const pageType = await PageType.findOne({
      $or: [
        { _id: body.pageType },
        { slug: String(body.pageType).toLowerCase() },
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
    CHECK DUPLICATE SLUG
    ========================================
    */

    const slug = String(body.slug)
      .trim()
      .toLowerCase();

    const existingPage = await Page.findOne({ slug });

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          message: "A page with this slug already exists",
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

      const region = await Region.findOne({
        $or: [
          { _id: body.region },
          { slug: String(body.region).toLowerCase() },
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

      if (!Array.isArray(body.price?.paxPrices)) {
        return NextResponse.json(
          {
            success: false,
            message: "PAX pricing tiers are required",
          },
          { status: 400 }
        );
      }

      paxPrices = body.price.paxPrices.map((tier) => ({
        minPax: Number(tier.minPax),
        maxPax:
          tier.maxPax === "" ||
          tier.maxPax === null ||
          tier.maxPax === undefined
            ? null
            : Number(tier.maxPax),
        pricePerPax: Number(tier.pricePerPax),
      }));
    }

    const price = {
      currency: body.price?.currency || "USD",
      pricingType,
      amount:
        body.price?.amount === "" ||
        body.price?.amount === undefined
          ? 0
          : Number(body.price.amount),
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

      pageType: pageType._id,

      region: regionId,

      imageUrl: body.imageUrl || "",

      description: body.description || "",

      content: body.content || "",

      price,

      trekDetails: body.trekDetails || {},

      tourDetails: body.tourDetails || {},

      itinerary: Array.isArray(body.itinerary)
        ? body.itinerary
        : [],

      inclusions: Array.isArray(body.inclusions)
        ? body.inclusions
        : [],

      exclusions: Array.isArray(body.exclusions)
        ? body.exclusions
        : [],

      importantInformation:
        body.importantInformation || "",

      seo: body.seo || {},

      published:
        body.published === true,

      order:
        Number(body.order) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Page created successfully",
        data: page,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error("POST /api/pages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}