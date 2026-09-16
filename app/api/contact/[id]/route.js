import { NextResponse } from "next/server";

import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { verifyAdminToken } from "@/lib/auth";

/*
==================================================
CHECK ADMIN
==================================================
*/

function isAdmin(request) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return false;
  }

  const admin = verifyAdminToken(token);

  return !!admin;
}

/*
==================================================
VALIDATE OBJECT ID
==================================================
*/

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/*
==================================================
ALLOWED STATUSES
==================================================
*/

const allowedStatuses = [
  "new",
  "read",
  "replied",
  "archived",
];

/*
==================================================
GET SINGLE CONTACT
ADMIN ONLY
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

    /*
    ==============================================
    GET ID
    ==============================================
    */

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact ID.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    FIND CONTACT
    ==============================================
    */

    const contact = await Contact.findById(id).lean();

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact message not found.",
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
      contact,
    });
  } catch (error) {
    console.error("CONTACT GET BY ID ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact message.",
      },
      { status: 500 }
    );
  }
}

/*
==================================================
PUT
UPDATE CONTACT
ADMIN ONLY
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

    /*
    ==============================================
    GET ID
    ==============================================
    */

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact ID.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    CHECK CONTACT EXISTS
    ==============================================
    */

    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact message not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==============================================
    READ BODY
    ==============================================
    */

    const body = await request.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
      status,
    } = body;

    /*
    ==============================================
    UPDATE BASIC FIELDS
    ==============================================
    */

    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Name cannot be empty.",
          },
          { status: 400 }
        );
      }

      contact.name = String(name).trim();
    }

    if (email !== undefined) {
      if (!String(email).trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Email cannot be empty.",
          },
          { status: 400 }
        );
      }

      contact.email = String(email).trim().toLowerCase();
    }

    if (phone !== undefined) {
      contact.phone = String(phone).trim();
    }

    if (subject !== undefined) {
      if (!String(subject).trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Subject cannot be empty.",
          },
          { status: 400 }
        );
      }

      contact.subject = String(subject).trim();
    }

    if (message !== undefined) {
      if (!String(message).trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Message cannot be empty.",
          },
          { status: 400 }
        );
      }

      contact.message = String(message).trim();
    }

    /*
    ==============================================
    UPDATE STATUS
    ==============================================
    */

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid contact status.",
          },
          { status: 400 }
        );
      }

      contact.status = status;
    }

    /*
    ==============================================
    SAVE
    ==============================================
    */

    await contact.save();

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json({
      success: true,
      message: "Contact message updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("CONTACT PUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update contact message.",
      },
      { status: 500 }
    );
  }
}

/*
==================================================
DELETE
ADMIN ONLY
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

    /*
    ==============================================
    GET ID
    ==============================================
    */

    const { id } = await params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact ID.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    DELETE CONTACT
    ==============================================
    */

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact message not found.",
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
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("CONTACT DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete contact message.",
      },
      { status: 500 }
    );
  }
}