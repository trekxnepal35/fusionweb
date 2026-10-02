import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";

import Admin from "@/models/Admin";

import { verifyAdminToken } from "@/lib/auth";


export async function POST(
  request,
  { params }
) {

  try {

    // =====================================================
    // VERIFY CURRENT ADMIN
    // =====================================================

    const token =
      request.cookies.get(
        "admin_token"
      )?.value;


    if (!token) {

      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );

    }


    const currentAdmin =
      verifyAdminToken(token);


    if (
      !currentAdmin ||
      currentAdmin.role !== "admin"
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );

    }


    // =====================================================
    // GET USER ID
    // =====================================================

    const { id } =
      await params;


    if (!id) {

      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required.",
        },
        {
          status: 400,
        }
      );

    }


    // =====================================================
    // REQUEST BODY
    // =====================================================

    const body =
      await request.json();


    const {
      password,
    } = body;


    if (!password) {

      return NextResponse.json(
        {
          success: false,
          message:
            "New password is required.",
        },
        {
          status: 400,
        }
      );

    }


    if (password.length < 8) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );

    }


    // =====================================================
    // DATABASE
    // =====================================================

    await connectDB();


    const admin =
      await Admin.findById(id);


    if (!admin) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Admin user not found.",
        },
        {
          status: 404,
        }
      );

    }


    // =====================================================
    // HASH NEW PASSWORD
    // =====================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    admin.password =
      hashedPassword;


    await admin.save();


    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({

      success: true,

      message:
        "Password reset successfully.",

    });


  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to reset password.",
      },
      {
        status: 500,
      }
    );

  }

}