import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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
GET REGIONS
========================================
*/

export async function GET() {

  try {

    await connectDB();

    const regions =
      await Region.find({})
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();


    return NextResponse.json({
      success: true,
      data: regions,
    });

  } catch (error) {

    console.error(
      "GET /api/regions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch regions",
      },
      { status: 500 }
    );
  }
}


/*
========================================
CREATE REGION
========================================
*/

export async function POST(request) {

  try {

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
            "Region name is required",
        },
        { status: 400 }
      );
    }


    if (!body.slug) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Region slug is required",
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
    DUPLICATE
    ========================================
    */

    const existing =
      await Region.findOne({
        slug,
      });


    if (existing) {

      return NextResponse.json(
        {
          success: false,
          message:
            "A region with this slug already exists",
        },
        { status: 409 }
      );
    }


    /*
    ========================================
    CREATE
    ========================================
    */

    const region =
      await Region.create({

        name:
          String(body.name).trim(),

        slug,

        description:
          body.description || "",

        imageUrl:
          body.imageUrl || "",

        published:
          body.published !== false,

        order:
          Number(body.order) || 0,
      });


    return NextResponse.json(
      {
        success: true,
        message:
          "Region created successfully",
        data: region,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "POST /api/regions error:",
      error
    );


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


    if (error.code === 11000) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Region slug already exists",
        },
        { status: 409 }
      );
    }


    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to create region",
      },
      { status: 500 }
    );
  }
}