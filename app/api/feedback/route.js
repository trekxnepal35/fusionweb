import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Page from "@/models/Page";

import { verifyAdminToken } from "@/lib/auth";

/*
==================================================
HELPER: CHECK ADMIN
==================================================
*/

function isAdmin(request) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return false;
  }

  return !!verifyAdminToken(token);
}

/*
==================================================
POST FEEDBACK
==================================================

Public users can submit feedback.

New feedback is always created as:
status: "pending"
*/

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      page,
      name,
      email,
      rating,
      comment,
    } = body;

    /*
    ==============================================
    VALIDATE PAGE
    ==============================================
    */

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: "Page is required.",
        },
        { status: 400 }
      );
    }

    const existingPage = await Page.findById(page)
      .select("_id title slug published")
      .lean();

    if (!existingPage) {
      return NextResponse.json(
        {
          success: false,
          message: "Page not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==============================================
    VALIDATE NAME
    ==============================================
    */

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    VALIDATE EMAIL
    ==============================================
    */

    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    BASIC EMAIL VALIDATION
    ==============================================
    */

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    VALIDATE RATING
    ==============================================
    */

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    VALIDATE COMMENT
    ==============================================
    */

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment is required.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    CREATE FEEDBACK
    ==============================================
    */

    const feedback = await Feedback.create({
      page: existingPage._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: numericRating,
      comment: comment.trim(),

      // Always pending when submitted publicly
      status: "pending",
    });

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for your feedback. It has been submitted for review.",
        data: feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/feedback error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit feedback.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/*
==================================================
GET FEEDBACK
==================================================

PUBLIC:
Returns only approved feedback.

ADMIN:
Returns pending, approved and rejected feedback.

Optional query parameters:

?page=1
&limit=10
&pageId=PAGE_ID
&status=approved
*/

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    /*
    ==============================================
    ADMIN CHECK
    ==============================================
    */

    const admin = isAdmin(request);

    /*
    ==============================================
    QUERY PARAMETERS
    ==============================================
    */

    const pageId = searchParams.get("pageId");
    const requestedStatus = searchParams.get("status");

    const requestedPage = Number(
      searchParams.get("page") || 1
    );

    const requestedLimit = Number(
      searchParams.get("limit") || 10
    );

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0 &&
      requestedLimit <= 100
        ? requestedLimit
        : 10;

    const skip = (page - 1) * limit;

    /*
    ==============================================
    BUILD FILTER
    ==============================================
    */

    const filter = {};

    /*
    ----------------------------------------------
    PUBLIC USERS
    ----------------------------------------------
    */

    if (!admin) {
      filter.status = "approved";
    }

    /*
    ----------------------------------------------
    ADMIN STATUS FILTER
    ----------------------------------------------
    */

    if (admin && requestedStatus) {
      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (!allowedStatuses.includes(requestedStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid feedback status.",
          },
          { status: 400 }
        );
      }

      filter.status = requestedStatus;
    }

    /*
    ==============================================
    FILTER BY PAGE
    ==============================================
    */

    if (pageId) {
      filter.page = pageId;
    }

    /*
    ==============================================
    COUNT
    ==============================================
    */

    const totalItems = await Feedback.countDocuments(filter);

    const totalPages =
      totalItems === 0
        ? 0
        : Math.ceil(totalItems / limit);

    /*
    ==============================================
    GET FEEDBACK
    ==============================================
    */

    const feedback = await Feedback.find(filter)
      .populate(
        "page",
        "title slug pageType imageUrl"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json({
      success: true,
      data: feedback,

      pagination: {
        page,
        limit,
        totalItems,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPrevPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/feedback error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch feedback.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}