import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";
import Region from "@/models/Region";

import { getS3SignedUrl } from "@/lib/s3";
import { resolvePageImages } from "@/lib/imageResolver";


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

    const trekDocuments = await Page.find(filter)
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
    PREPARE TREK CARD IMAGES
    ==================================================

    Priority:

    1. Uploaded S3 image
    2. Uploaded Cloudinary image
    3. Manual imageUrl
    4. Empty string

    S3 images are converted into signed URLs.
    ==================================================
    */

    const treks = await Promise.all(

      trekDocuments.map(async (trek) => {

        let cardImageUrl = trek.imageUrl || "";

        
        /*
        ==============================================
        FIND FIRST UPLOADED IMAGE
        ==============================================
        */

        const uploadedImage =
          Array.isArray(trek.images)
            ? trek.images.find(
              (image) =>
                image &&
                image.url
            )
            : null;


        /*
        ==============================================
        S3 IMAGE
        ==============================================
        */

        if (
          uploadedImage &&
          uploadedImage.storage === "s3" &&
          uploadedImage.key
        ) {

          try {

            cardImageUrl =
              await getS3SignedUrl(
                uploadedImage.key,
                3600
              );

          } catch (error) {

            console.error(
              "Failed to create S3 signed URL for trek:",
              trek._id,
              error
            );

            /*
            ------------------------------------------
            Keep manual imageUrl as fallback
            ------------------------------------------
            */

            cardImageUrl =
              trek.imageUrl || "";

          }

        }


        /*
        ==============================================
        CLOUDINARY IMAGE
        ==============================================
        */

        if (
          uploadedImage &&
          uploadedImage.storage === "cloudinary" &&
          uploadedImage.url
        ) {

          cardImageUrl =
            uploadedImage.url;

        }


        /*
        ==============================================
        RETURN TREK
        ==============================================
        */

        return {
          ...trek,

          /*
          --------------------------------------------
          READY-TO-DISPLAY CARD IMAGE
          --------------------------------------------
          */

          cardImageUrl,
        };

      })

    );

    // AWS resolve image
    const treksWithImages =
    await resolvePageImages(treks);


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

    console.error(
      "GET TREKS ERROR:",
      error
    );


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