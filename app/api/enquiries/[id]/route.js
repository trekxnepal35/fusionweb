import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";

import { verifyAdminToken } from "@/lib/auth";

/*
=========================================
ADMIN AUTH
=========================================
*/

function getAdminFromRequest(request) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}

/*
=========================================
GET SINGLE ENQUIRY
ADMIN ONLY
=========================================
*/

export async function GET(request, { params }) {
  try {
    /*
    ========================================
    CHECK ADMIN
    ========================================
    */

    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();

    /*
    ========================================
    GET ID
    ========================================
    */

    const { id } = await params;

    /*
    ========================================
    FIND ENQUIRY
    ========================================
    */

    const enquiry = await Enquiry.findById(id)
      .populate({
        path: "experience",
        select: "title slug imageUrl pageType region price published",
        populate: [
          {
            path: "pageType",
            select: "name slug bookable",
          },
          {
            path: "region",
            select: "name slug",
          },
        ],
      })
      .lean();

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error("GET SINGLE ENQUIRY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enquiry",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================
UPDATE ENQUIRY
ADMIN ONLY
=========================================
*/

export async function PUT(request, { params }) {
  try {
    /*
    ========================================
    CHECK ADMIN
    ========================================
    */

    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();

    /*
    ========================================
    GET ID
    ========================================
    */

    const { id } = await params;

    /*
    ========================================
    GET REQUEST BODY
    ========================================
    */

    const body = await request.json();

    /*
    ========================================
    FIND ENQUIRY
    ========================================
    */

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
    ========================================
    UPDATE CUSTOMER INFORMATION
    ========================================
    */

    if (typeof body.name === "string") {
      enquiry.name = body.name.trim();
    }

    if (typeof body.email === "string") {
      enquiry.email = body.email.trim().toLowerCase();
    }

    if (typeof body.phone === "string") {
      enquiry.phone = body.phone.trim();
    }

    if (typeof body.country === "string") {
      enquiry.country = body.country.trim();
    }

    /*
    ========================================
    UPDATE TRIP INFORMATION
    ========================================
    */

    if (
      body.numberOfPeople !== undefined &&
      body.numberOfPeople !== null
    ) {
      const numberOfPeople = Number(body.numberOfPeople);

      if (
        !Number.isInteger(numberOfPeople) ||
        numberOfPeople < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Number of people must be at least 1",
          },
          {
            status: 400,
          }
        );
      }

      enquiry.numberOfPeople = numberOfPeople;
    }

    if (body.preferredDate !== undefined) {
      enquiry.preferredDate = body.preferredDate
        ? new Date(body.preferredDate)
        : null;
    }

    if (typeof body.message === "string") {
      enquiry.message = body.message.trim();
    }

    /*
    ========================================
    UPDATE STATUS
    ========================================
    */

    if (body.status !== undefined) {
      const allowedStatuses = [
        "new",
        "read",
        "replied",
        "closed",
      ];

      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid enquiry status",
          },
          {
            status: 400,
          }
        );
      }

      enquiry.status = body.status;
    }

    /*
    ========================================
    SAVE
    ========================================
    */

    await enquiry.save();

    /*
    ========================================
    LOAD UPDATED ENQUIRY
    ========================================
    */

    const updatedEnquiry = await Enquiry.findById(id)
      .populate({
        path: "experience",
        select: "title slug imageUrl pageType region price published",
        populate: [
          {
            path: "pageType",
            select: "name slug bookable",
          },
          {
            path: "region",
            select: "name slug",
          },
        ],
      })
      .lean();

    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json({
      success: true,
      message: "Enquiry updated successfully",
      data: updatedEnquiry,
    });
  } catch (error) {
    console.error("UPDATE ENQUIRY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update enquiry",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================
DELETE ENQUIRY
ADMIN ONLY
=========================================
*/

export async function DELETE(request, { params }) {
  try {
    /*
    ========================================
    CHECK ADMIN
    ========================================
    */

    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();

    /*
    ========================================
    GET ID
    ========================================
    */

    const { id } = await params;

    /*
    ========================================
    DELETE
    ========================================
    */

    const enquiry =
      await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
    ========================================
    RESPONSE
    ========================================
    */

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ENQUIRY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete enquiry",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}