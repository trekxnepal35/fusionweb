import { NextResponse } from "next/server";

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
VALIDATE EMAIL
==================================================
*/

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/*
==================================================
POST
PUBLIC CONTACT FORM SUBMISSION
==================================================
*/

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      email,
      phone = "",
      subject,
      message,
    } = body;

    /*
    ==============================================
    REQUIRED FIELDS
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

    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject is required.",
        },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    LENGTH VALIDATION
    ==============================================
    */

    if (name.trim().length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is too long.",
        },
        { status: 400 }
      );
    }

    if (email.trim().length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is too long.",
        },
        { status: 400 }
      );
    }

    if (subject.trim().length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject is too long.",
        },
        { status: 400 }
      );
    }

    if (message.trim().length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is too long.",
        },
        { status: 400 }
      );
    }

    /*
    ==============================================
    CREATE CONTACT MESSAGE
    ==============================================
    */

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
    });

    /*
    ==============================================
    SUCCESS
    ==============================================
    */

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully.",
        contact: {
          id: contact._id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CONTACT POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send your message.",
      },
      { status: 500 }
    );
  }
}

/*
==================================================
GET
ADMIN ONLY
==================================================
*/

export async function GET(request) {
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
    QUERY PARAMETERS
    ==============================================
    */

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || "";
    const page = Math.max(
      parseInt(searchParams.get("page") || "1", 10),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(searchParams.get("limit") || "20", 10),
        1
      ),
      100
    );

    /*
    ==============================================
    FILTER
    ==============================================
    */

    const filter = {};

    if (status) {
      const allowedStatuses = [
        "new",
        "read",
        "replied",
        "archived",
      ];

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid status.",
          },
          { status: 400 }
        );
      }

      filter.status = status;
    }

    /*
    ==============================================
    COUNT
    ==============================================
    */

    const total = await Contact.countDocuments(filter);

    /*
    ==============================================
    FETCH CONTACTS
    ==============================================
    */

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return NextResponse.json({
      success: true,

      contacts,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("CONTACT GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contact messages.",
      },
      { status: 500 }
    );
  }
}