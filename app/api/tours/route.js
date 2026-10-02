import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import PageType from "@/models/PageType";

import { getS3SignedUrl } from "@/lib/s3";


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

    const tourDocuments = await Page.find({
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
    PREPARE TOUR CARD IMAGES
    ==================================================

    Priority:

    1. Uploaded S3 image
    2. Uploaded Cloudinary image
    3. Manual imageUrl
    4. Empty string

    S3 images are converted into signed URLs.
    ==================================================
    */

    const tours = await Promise.all(

      tourDocuments.map(async (tour) => {

        /*
        ==============================================
        DEFAULT TO MANUAL IMAGE URL
        ==============================================
        */

        let cardImageUrl = tour.imageUrl || "";


        /*
        ==============================================
        FIND FIRST UPLOADED IMAGE
        ==============================================
        */

        const uploadedImage =
          Array.isArray(tour.images)
            ? tour.images.find(
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
              "Failed to create S3 signed URL for tour:",
              tour._id,
              error
            );


            /*
            ------------------------------------------
            FALL BACK TO MANUAL IMAGE URL
            ------------------------------------------
            */

            cardImageUrl =
              tour.imageUrl || "";

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
        RETURN TOUR
        ==============================================
        */

        return {
          ...tour,

          /*
          --------------------------------------------
          READY-TO-DISPLAY IMAGE URL
          --------------------------------------------
          */

          cardImageUrl,
        };

      })

    );


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

    console.error(
      "GET TOURS ERROR:",
      error
    );


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