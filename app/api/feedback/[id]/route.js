import { NextResponse } from "next/server";

import mongoose from "mongoose";

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
HELPER: GET FEEDBACK ID
==================================================
*/

async function getFeedbackId(params) {
  const resolvedParams = await params;

  return resolvedParams.id;
}

/*
==================================================
GET SINGLE FEEDBACK
==================================================
*/

export async function GET(request, { params }) {
  try {
    /*
    ==============================================
    ADMIN AUTHENTICATION
    ==============================================
    */

    if (!isAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const id = await getFeedbackId(params);

    /*
    ==============================================
    VALIDATE OBJECT ID
    ==============================================
    */

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid feedback ID.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    FIND FEEDBACK
    ==============================================
    */

    const feedback = await Feedback.findById(id)
      .populate(
        "page",
        "title slug pageType imageUrl"
      )
      .lean();

    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("GET /api/feedback/[id] error:", error);

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

/*
==================================================
PUT FEEDBACK
==================================================

Admin can update:

- name
- email
- rating
- comment
- status
- page
==================================================
*/

export async function PUT(request, { params }) {
  try {
    /*
    ==============================================
    ADMIN AUTHENTICATION
    ==============================================
    */

    if (!isAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const id = await getFeedbackId(params);

    /*
    ==============================================
    VALIDATE OBJECT ID
    ==============================================
    */

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid feedback ID.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    READ REQUEST BODY
    ==============================================
    */

    const body = await request.json();

    const {
      page,
      name,
      email,
      rating,
      comment,
      status,
    } = body;

    /*
    ==============================================
    FIND EXISTING FEEDBACK
    ==============================================
    */

    const existingFeedback =
      await Feedback.findById(id);

    if (!existingFeedback) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==============================================
    BUILD UPDATE OBJECT
    ==============================================
    */

    const updateData = {};

    /*
    ==============================================
    PAGE
    ==============================================
    */

    if (page !== undefined) {
      if (!mongoose.isValidObjectId(page)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid page ID.",
          },
          { status: 400 }
        );
      }

      const existingPage =
        await Page.findById(page)
          .select("_id")
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

      updateData.page = page;
    }

    /*
    ==============================================
    NAME
    ==============================================
    */

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Name cannot be empty.",
          },
          { status: 400 }
        );
      }

      updateData.name = name.trim();
    }

    /*
    ==============================================
    EMAIL
    ==============================================
    */

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Email cannot be empty.",
          },
          { status: 400 }
        );
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email.trim())) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide a valid email address.",
          },
          { status: 400 }
        );
      }

      updateData.email =
        email.trim().toLowerCase();
    }

    /*
    ==============================================
    RATING
    ==============================================
    */

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Rating must be between 1 and 5.",
          },
          { status: 400 }
        );
      }

      updateData.rating = numericRating;
    }

    /*
    ==============================================
    COMMENT
    ==============================================
    */

    if (comment !== undefined) {
      if (
        typeof comment !== "string" ||
        !comment.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Comment cannot be empty.",
          },
          { status: 400 }
        );
      }

      updateData.comment = comment.trim();
    }

    /*
    ==============================================
    STATUS
    ==============================================
    */

    if (status !== undefined) {
      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid feedback status.",
          },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    /*
    ==============================================
    UPDATE FEEDBACK
    ==============================================
    */

    const updatedFeedback =
      await Feedback.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "page",
          "title slug pageType imageUrl"
        )
        .lean();

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json({
      success: true,
      message: "Feedback updated successfully.",
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("PUT /api/feedback/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update feedback.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/*
==================================================
DELETE FEEDBACK
==================================================
*/

export async function DELETE(request, { params }) {
  try {
    /*
    ==============================================
    ADMIN AUTHENTICATION
    ==============================================
    */

    if (!isAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const id = await getFeedbackId(params);

    /*
    ==============================================
    VALIDATE OBJECT ID
    ==============================================
    */

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid feedback ID.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    DELETE FEEDBACK
    ==============================================
    */

    const deletedFeedback =
      await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully.",
      data: deletedFeedback,
    });
  } catch (error) {
    console.error(
      "DELETE /api/feedback/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete feedback.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}