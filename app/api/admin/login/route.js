import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import connectDB from "@/lib/mongodb";

import Admin from "@/models/Admin";


export async function POST(request) {

  try {

    await connectDB();


    const body =
      await request.json();


    const {
      email,
      password,
    } = body;


    if (
      !email ||
      !password
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        {
          status: 400,
        }
      );

    }


    const admin =
      await Admin.findOne({

        email:
          email.toLowerCase(),

      });


    if (!admin) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );

    }


    const passwordMatch =
      await bcrypt.compare(
        password,
        admin.password
      );


    if (!passwordMatch) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );

    }


    const token =
      jwt.sign(

        {
          id:
            String(admin._id),

          email:
            admin.email,

          role:
            admin.role,

        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "1d",
        }

      );


    const response =
      NextResponse.json({

        success: true,

        message:
          "Login successful.",

        data: {
          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role,
        },

      });


    response.cookies.set(
      "admin_token",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        maxAge:
          60 * 60 * 24,

        path: "/",
      }
    );


    return response;


  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Login failed.",
      },
      {
        status: 500,
      }
    );

  }

}