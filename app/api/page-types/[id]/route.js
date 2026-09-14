
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
GET SINGLE PAGE TYPE
========================================
*/

export async function GET(
  request,
  { params }
) {

  try {

    await connectDB();

    const { id } =
      await params;


    const pageType =
      await PageType.findById(id)
        .lean();


    if (!pageType) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type not found",
        },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      data: pageType,
    });

  } catch (error) {

    console.error(
      "GET page type error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch page type",
      },
      { status: 500 }
    );
  }
}


/*
========================================
UPDATE PAGE TYPE
========================================
*/

export async function PUT(
  request,
  { params }
) {

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


    const { id } =
      await params;

    const body =
      await request.json();


    /*
    ========================================
    FIND PAGE TYPE
    ========================================
    */

    const pageType =
      await PageType.findById(id);


    if (!pageType) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type not found",
        },
        { status: 404 }
      );
    }


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

    const duplicate =
      await PageType.findOne({
        slug,
        _id: {
          $ne: id,
        },
      });


    if (duplicate) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Another page type already uses this slug",
        },
        { status: 409 }
      );
    }


    /*
    ========================================
    UPDATE
    ========================================
    */

    pageType.name =
      String(body.name).trim();

    pageType.slug =
      slug;

    pageType.description =
      body.description || "";

    pageType.imageUrl =
      body.imageUrl || "";

    /*
    ========================================
    BOOKABLE
    ========================================
    */

    /*
      Only boolean false means
      "Not Bookable".

      If the field is missing,
      keep the existing value.
    */

    if (
      typeof body.bookable ===
      "boolean"
    ) {

      pageType.bookable =
        body.bookable;

    }


    pageType.published =
      body.published !== false;

    pageType.order =
      Number(body.order) || 0;


    await pageType.save();


    return NextResponse.json({
      success: true,
      message:
        "Page type updated successfully",
      data: pageType,
    });

  } catch (error) {

    console.error(
      "PUT page type error:",
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
          "Failed to update page type",
      },
      { status: 500 }
    );
  }
}


/*
========================================
DELETE PAGE TYPE
========================================
*/

export async function DELETE(
  request,
  { params }
) {

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


    const { id } =
      await params;


    const pageType =
      await PageType.findByIdAndDelete(id);


    if (!pageType) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Page type not found",
        },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      message:
        "Page type deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE page type error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to delete page type",
      },
      { status: 500 }
    );
  }
}

