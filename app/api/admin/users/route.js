import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Admin from "@/models/Admin";

import { verifyAdminToken } from "@/lib/auth";


function getAuthenticatedAdmin(request) {

  const token =
    request.cookies.get(
      "admin_token"
    )?.value;


  if (!token) {

    return null;

  }


  const admin =
    verifyAdminToken(token);


  if (
    !admin ||
    admin.role !== "admin"
  ) {

    return null;

  }


  return admin;

}


// =====================================================
// GET ALL ADMIN USERS
// =====================================================

export async function GET(request) {

  try {

    const currentAdmin =
      getAuthenticatedAdmin(
        request
      );


    if (!currentAdmin) {

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


    await connectDB();


    const admins =
      await Admin.find({})
        .select(
          "_id name email role createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    return NextResponse.json({

      success: true,

      data:
        admins.map(
          (admin) => ({

            id:
              String(admin._id),

            name:
              admin.name,

            email:
              admin.email,

            role:
              admin.role,

            createdAt:
              admin.createdAt,

            updatedAt:
              admin.updatedAt,

          })
        ),

    });


  } catch (error) {

    console.error(
      "Get admin users error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load admin users.",
      },
      {
        status: 500,
      }
    );

  }

}