import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Region from "@/models/Region";

import { verifyAdminToken } from "@/lib/auth";
import { getS3SignedUrl } from "@/lib/s3";


function getAdminFromRequest(request) {

  const token =
    request.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}


/*
========================================
GET REGIONS
========================================
*/

export async function GET(request) {

  try {

    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();


    /*
    ========================================
    GET QUERY PARAMETERS
    ========================================
    */

    const { searchParams } =
      new URL(request.url);

    const published =
      searchParams.get("published");


    /*
    ========================================
    BUILD FILTER
    ========================================
    */

    const filter = {};


    /*
    ========================================
    PUBLISHED FILTER
    ========================================
    */

    if (published === "true") {

      filter.published = true;

    }

    if (published === "false") {

      filter.published = false;

    }


    /*
    ========================================
    GET REGIONS
    ========================================
    */

    const regionDocuments =
      await Region.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();


    /*
    ========================================
    PREPARE REGION CARD IMAGES
    ========================================

    Priority:

    1. S3 image
    2. Cloudinary image
    3. Manual imageUrl
    4. Empty string

    S3 images are converted into
    temporary signed URLs.
    ========================================
    */

    const regions =
      await Promise.all(

        regionDocuments.map(
          async (region) => {

            /*
            ==================================
            DEFAULT TO MANUAL IMAGE URL
            ==================================
            */

            let cardImageUrl =
              region.imageUrl || "";


            /*
            ==================================
            CHECK FOR UPLOADED IMAGES
            ==================================

            Region currently uses imageUrl
            directly, so we first check whether
            an images array exists.

            This also keeps compatibility with
            future uploaded-image support.
            ==================================
            */

            const uploadedImage =
              Array.isArray(region.images)
                ? region.images.find(
                    (image) =>
                      image &&
                      image.url
                  )
                : null;


            /*
            ==================================
            S3 IMAGE
            ==================================
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
                  "Failed to create S3 signed URL for region:",
                  region._id,
                  error
                );


                /*
                ------------------------------
                FALL BACK TO MANUAL IMAGE URL
                ------------------------------
                */

                cardImageUrl =
                  region.imageUrl || "";

              }

            }


            /*
            ==================================
            CLOUDINARY IMAGE
            ==================================
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
            ==================================
            RETURN REGION
            ==================================
            */

            return {

              ...region,

              /*
              ------------------------------
              READY-TO-DISPLAY IMAGE URL
              ------------------------------
              */

              cardImageUrl,

            };

          }
        )

      );


    /*
    ========================================
    RETURN REGIONS
    ========================================
    */

    return NextResponse.json({

      success: true,

      count: regions.length,

      data: regions,

    });

  } catch (error) {

    console.error(
      "GET /api/regions error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Failed to fetch regions",

      },
      {
        status: 500,
      }
    );

  }

}


/*
========================================
CREATE REGION
========================================
*/

export async function POST(request) {

  try {

    /*
    ========================================
    CHECK ADMIN
    ========================================
    */

    const admin =
      getAdminFromRequest(request);


    if (!admin) {

      return NextResponse.json(
        {
          success: false,

          message:
            "Unauthorized. Admin login required.",

        },
        {
          status: 401,
        }
      );

    }


    /*
    ========================================
    CONNECT DATABASE
    ========================================
    */

    await connectDB();


    /*
    ========================================
    READ REQUEST BODY
    ========================================
    */

    const body =
      await request.json();


    /*
    ========================================
    VALIDATION
    ========================================
    */

    if (!body.name) {

      return NextResponse.json(
        {
          success: false,

          message:
            "Region name is required",

        },
        {
          status: 400,
        }
      );

    }


    if (!body.slug) {

      return NextResponse.json(
        {
          success: false,

          message:
            "Region slug is required",

        },
        {
          status: 400,
        }
      );

    }


    /*
    ========================================
    NORMALIZE SLUG
    ========================================
    */

    const slug =
      String(body.slug)
        .trim()
        .toLowerCase();


    /*
    ========================================
    CHECK DUPLICATE
    ========================================
    */

    const existing =
      await Region.findOne({
        slug,
      });


    if (existing) {

      return NextResponse.json(
        {
          success: false,

          message:
            "A region with this slug already exists",

        },
        {
          status: 409,
        }
      );

    }


    /*
    ========================================
    CREATE REGION
    ========================================
    */

    const region =
      await Region.create({

        name:
          String(body.name).trim(),

        slug,

        description:
          body.description || "",

        imageUrl:
          body.imageUrl || "",

        published:
          body.published !== false,

        order:
          Number(body.order) || 0,

      });


    /*
    ========================================
    RETURN CREATED REGION
    ========================================
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Region created successfully",

        data: region,

      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "POST /api/regions error:",
      error
    );


    /*
    ========================================
    MONGOOSE VALIDATION ERROR
    ========================================
    */

    if (
      error.name ===
      "ValidationError"
    ) {

      const messages =
        Object.values(error.errors)
          .map(
            (item) =>
              item.message
          );


      return NextResponse.json(
        {
          success: false,

          message:
            messages.join(", "),

        },
        {
          status: 400,
        }
      );

    }


    /*
    ========================================
    DUPLICATE KEY ERROR
    ========================================
    */

    if (
      error.code === 11000
    ) {

      return NextResponse.json(
        {
          success: false,

          message:
            "Region slug already exists",

        },
        {
          status: 409,
        }
      );

    }


    /*
    ========================================
    GENERAL ERROR
    ========================================
    */

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Failed to create region",

      },
      {
        status: 500,
      }
    );

  }

}