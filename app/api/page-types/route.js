
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PageType from "@/models/PageType";
import { verifyAdminToken } from "@/lib/auth";


/*
========================================
ADMIN AUTH
========================================
*/

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
GET ALL PAGE TYPES
========================================
*/

export async function GET() {

  try {

    await connectDB();

    const pageTypes =
      await PageType.find({})
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      data: pageTypes,
    });

  } catch (error) {

    console.error(
      "GET /api/page-types error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch page types",
      },
      { status: 500 }
    );
  }
}


/*
========================================
CREATE PAGE TYPE
========================================
*/

export async function POST(request) {

  try {

    /*
    ========================================
    ADMIN AUTH
    ========================================
    */

    const admin =
      getAdminFromRequest(request);

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


    const body =
      await request.json();


    /*
    ========================================
    VALIDATION
    ========================================
    */

    if (!body.name) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type name is required",
        },
        { status: 400 }
      );
    }


    if (!body.slug) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type slug is required",
        },
        { status: 400 }
      );
    }


    const slug =
      String(body.slug)
        .trim()
        .toLowerCase();


    /*
    ========================================
    DUPLICATE SLUG
    ========================================
    */

    const existing =
      await PageType.findOne({
        slug,
      });

    if (existing) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A page type with this slug already exists",
        },
        { status: 409 }
      );
    }


    /*
    ========================================
    BOOKABLE
    ========================================
    */

    /*
      Only boolean false means
      "not bookable".

      If bookable is omitted,
      the model default will be true.
    */

    const bookable =
      body.bookable !== false;


    /*
    ========================================
    CREATE
    ========================================
    */

    const pageType =
      await PageType.create({

        name:
          String(body.name).trim(),

        slug,

        description:
          body.description || "",

        imageUrl:
          body.imageUrl || "",

        bookable,

        published:
          body.published !== false,

        order:
          Number(body.order) || 0,
      });


    return NextResponse.json(
      {
        success: true,
        message:
          "Page type created successfully",
        data: pageType,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "POST /api/page-types error:",
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
        Object.values(error.errors)
          .map(
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
    DUPLICATE KEY ERROR
    ========================================
    */

    if (error.code === 11000) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type slug already exists",
        },
        { status: 409 }
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
          error.message ||
          "Failed to create page type",
      },
      { status: 500 }
    );
  }
}

