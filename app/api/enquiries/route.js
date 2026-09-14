import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import Page from "@/models/Page";

import PageType from "@/models/PageType";
import { verifyAdminToken } from "@/lib/auth";


/*
=========================================
HELPER
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
GET ALL ENQUIRIES
ADMIN ONLY
=========================================
*/

export async function GET(request) {
  try {
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

    await connectDB();

    const enquiries = await Enquiry.find({})
      .populate({
        path: "experience",
        select: "title slug imageUrl pageType region",
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
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: enquiries,
    });
  } catch (error) {
    console.error("GET ENQUIRIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enquiries",
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
CREATE ENQUIRY
PUBLIC
=========================================
*/

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

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
    BASIC VALIDATION
    ========================================
    */

    if (!experienceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!experienceType) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience type is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
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
          message: "Email is required",
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
          message: "Phone number is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!numberOfPeople || Number(numberOfPeople) < 1) {
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

    /*
    ========================================
    FIND EXPERIENCE
    ========================================
    */

    const experience = await Page.findById(experienceId)
      .populate({
        path: "pageType",
        select: "name slug bookable",
      })
      .lean();

    if (!experience) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
    ========================================
    CHECK PAGE TYPE
    ========================================
    */

    if (!experience.pageType) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience page type is missing",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ========================================
    VERIFY EXPERIENCE TYPE
    ========================================
    */

    const requestedType = String(experienceType)
      .trim()
      .toLowerCase();

    const actualType = String(
      experience.pageType.slug
    )
      .trim()
      .toLowerCase();

    if (requestedType !== actualType) {
      return NextResponse.json(
        {
          success: false,
          message: "Experience type does not match the selected experience",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ========================================
    CHECK BOOKABLE
    ========================================
    */

    if (experience.pageType.bookable !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "This experience does not accept enquiries",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ========================================
    CHECK PUBLISHED
    ========================================
    */

    if (experience.published !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "This experience is not available",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ========================================
    CREATE ENQUIRY
    ========================================
    */

    const enquiry = await Enquiry.create({
      experience: experience._id,

      experienceType: actualType,

      experienceTitle: experience.title,

      name: name.trim(),

      email: email.trim().toLowerCase(),

      phone: phone.trim(),

      country: country?.trim() || "",

      numberOfPeople: Number(numberOfPeople),

      preferredDate: preferredDate
        ? new Date(preferredDate)
        : null,

      message: message?.trim() || "",

      status: "new",
    });

    /*
    ========================================
    RETURN SUCCESS
    ========================================
    */

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully",

        data: {
          id: enquiry._id,
          experienceTitle: enquiry.experienceTitle,
          experienceType: enquiry.experienceType,
          status: enquiry.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit enquiry",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}