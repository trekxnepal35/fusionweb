import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";


/*
====================================================
GET ALL TREKS
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
    GET QUERY PARAMETERS
    ==================================================
    */

    const { searchParams } = new URL(request.url);

    const regionSlug = searchParams.get("region");


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
    IF TREK PAGE TYPE DOES NOT EXIST
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
    BUILD FILTER
    ==================================================
    */

    const filter = {
      pageType: trekPageType._id,
      published: true,
    };


    /*
    ==================================================
    REGION FILTER
    ==================================================
    */

    if (regionSlug) {

      const region = await Region.findOne({
        slug: regionSlug,
        published: true,
      }).lean();


      /*
      ================================================
      REGION NOT FOUND
      ================================================
      */

      if (!region) {

        return NextResponse.json(
          {
            success: false,
            message: "Region not found",
          },
          {
            status: 404,
          }
        );

      }


      filter.region = region._id;

    }


    /*
    ==================================================
    GET TREKS
    ==================================================
    */

    const treks = await Page.find(filter)
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
    RETURN TREKS
    ==================================================
    */

    return NextResponse.json(
      {
        success: true,
        count: treks.length,
        data: treks,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("GET TREKS ERROR:", error);


    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch treks",
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }

}