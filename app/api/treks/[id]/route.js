import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";


/*
====================================================
GET SINGLE TREK
====================================================
*/

export async function GET(
  request,
  { params }
) {

  try {

    /*
    ==================================================
    CONNECT DATABASE
    ==================================================
    */

    await connectDB();


    /*
    ==================================================
    GET SLUG
    ==================================================
    */

    const { id } = await params;


    /*
    ==================================================
    VALIDATE SLUG
    ==================================================
    */

    if (!id) {

      return NextResponse.json(
        {
          success: false,
          message: "Trek slug is required",
        },
        {
          status: 400,
        }
      );

    }


    /*
    ==================================================
    FIND TREK PAGE TYPE
    ==================================================
    */

    const trekPageType = await PageType.findOne({
      slug: "trek",
      published: true,
    }).lean();


    /*
    ==================================================
    PAGE TYPE NOT FOUND
    ==================================================
    */

    if (!trekPageType) {

      return NextResponse.json(
        {
          success: false,
          message: "Trek page type not found",
        },
        {
          status: 404,
        }
      );

    }


    /*
    ==================================================
    FIND TREK
    ==================================================
    */

    const trek = await Page.findOne({
      slug: id,
      pageType: trekPageType._id,
      published: true,
    })
      .populate(
        "pageType",
        "name slug description imageUrl"
      )
      .populate(
        "region",
        "name slug description imageUrl"
      )
      .lean();


    /*
    ==================================================
    TREK NOT FOUND
    ==================================================
    */

    if (!trek) {

      return NextResponse.json(
        {
          success: false,
          message: "Trek not found",
        },
        {
          status: 404,
        }
      );

    }


    /*
    ==================================================
    RETURN TREK
    ==================================================
    */

    return NextResponse.json(
      {
        success: true,
        data: trek,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("GET SINGLE TREK ERROR:", error);


    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch trek",
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }

}