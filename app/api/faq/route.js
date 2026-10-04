import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";


export async function GET() {

  try {

    await connectDB();


    const FAQ_PAGE_ID =
      process.env.FAQ_PAGE_ID;


    if (!FAQ_PAGE_ID) {

      return NextResponse.json(
        {
          success: false,
          error: "FAQ_PAGE_ID is not configured.",
        },
        {
          status: 500,
        }
      );

    }


    const page =
      await Page.findById(
        FAQ_PAGE_ID
      ).lean();


    if (!page) {

      return NextResponse.json(
        {
          success: false,
          error: "FAQ page not found.",
        },
        {
          status: 404,
        }
      );

    }


    return NextResponse.json(
      {
        success: true,
        data: page,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "FAQ API error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        error: "Failed to load FAQs.",
      },
      {
        status: 500,
      }
    );

  }

}