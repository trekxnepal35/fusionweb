import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request) {

  try {

    await connectDB();

    const body =
      await request.json();

    const {
      name,
      email,
      password,
    } = body;


    if (
      !name ||
      !email ||
      !password
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required.",
        },
        {
          status: 400,
        }
      );

    }


    const existingAdmin =
      await Admin.findOne({
        email:
          email.toLowerCase(),
      });


    if (existingAdmin) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Admin already exists.",
        },
        {
          status: 409,
        }
      );

    }


    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    const admin =
      await Admin.create({

        name,

        email:
          email.toLowerCase(),

        password:
          hashedPassword,

        role: "admin",

      });


    return NextResponse.json({

      success: true,

      message:
        "Admin created successfully.",

      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },

    });


  } catch (error) {

    console.error(
      "Admin registration error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create admin.",
      },
      {
        status: 500,
      }
    );

  }

}