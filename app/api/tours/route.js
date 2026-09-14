import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";


/*
====================================================
GET ALL TOURS
====================================================
*/

export async function GET(request) {

  try {

    /*
    ==================================================
    CONNECT DATABASE
    ==================================================
    */

    await connectDB();


    /*
    ==================================================
    FIND TOUR PAGE TYPE
    ==================================================
    */

    const tourPageType = await PageType.findOne({
      slug: "tour",
      published: true,
    }).lean();


    /*
    ==================================================
    PAGE TYPE NOT FOUND
    ==================================================
    */

    if (!tourPageType) {

      return NextResponse.json(
        {
          success: false,
          message: "Tour page type not found",
        },
        {
          status: 404,
        }
      );

    }


    /*
    ==================================================
    GET TOURS
    ==================================================
    */

    const tours = await Page.find({
      pageType: tourPageType._id,
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
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();


    /*
    ==================================================
    RETURN TOURS
    ==================================================
    */

    return NextResponse.json(
      {
        success: true,
        count: tours.length,
        data: tours,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("GET TOURS ERROR:", error);


    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tours",
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }

}