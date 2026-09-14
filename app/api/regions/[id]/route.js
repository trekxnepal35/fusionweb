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
GET SINGLE REGION
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


    const region =
      await Region.findById(id)
        .lean();


    if (!region) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Region not found",
        },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      data: region,
    });

  } catch (error) {

    console.error(
      "GET region error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      { status: 500 }
    );
  }
}


/*
========================================
UPDATE REGION
========================================
*/

export async function PUT(
  request,
  { params }
) {

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


    const { id } =
      await params;

    const body =
      await request.json();


    const region =
      await Region.findById(id);


    if (!region) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Region not found",
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

    const duplicate =
      await Region.findOne({
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
            "Another region already uses this slug",
        },
        { status: 409 }
      );
    }


    /*
    ========================================
    UPDATE
    ========================================
    */

    region.name =
      String(body.name).trim();

    region.slug =
      slug;

    region.description =
      body.description || "";

    region.imageUrl =
      body.imageUrl || "";

    region.published =
      body.published !== false;

    region.order =
      Number(body.order) || 0;


    await region.save();


    return NextResponse.json({
      success: true,
      message:
        "Region updated successfully",
      data: region,
    });

  } catch (error) {

    console.error(
      "PUT region error:",
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
          "Failed to update region",
      },
      { status: 500 }
    );
  }
}


/*
========================================
DELETE REGION
========================================
*/

export async function DELETE(
  request,
  { params }
) {

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


    const { id } =
      await params;


    const region =
      await Region.findByIdAndDelete(id);


    if (!region) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Region not found",
        },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      message:
        "Region deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE region error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to delete region",
      },
      { status: 500 }
    );
  }
}