import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";

import Booking from "@/models/Booking";
import Page from "@/models/Page";
import PageType from "@/models/PageType";

import { verifyAdminToken } from "@/lib/auth";


/*
====================================================
GET SINGLE BOOKING
====================================================
*/

export async function GET(request, { params }) {

    try {

        /*
        ================================================
        CONNECT DATABASE
        ================================================
        */

        await connectDB();


        /*
        ================================================
        ADMIN AUTHENTICATION
        ================================================
        */

        const token = request.cookies.get("admin_token")?.value;

        const admin = verifyAdminToken(token);

        if (!admin) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }


        /*
        ================================================
        GET BOOKING ID
        ================================================
        */

        const { id } = await params;


        /*
        ================================================
        FIND BOOKING
        ================================================
        */

        const booking = await Booking.findById(id)
            .populate({
                path: "experience",
                select: "title slug imageUrl pageType region price published",
                populate: [
                    {
                        path: "pageType",
                        select: "name slug",
                    },
                    {
                        path: "region",
                        select: "name slug",
                    },
                ],
            })
            .lean();


        /*
        ================================================
        BOOKING NOT FOUND
        ================================================
        */

        if (!booking) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Booking not found",
                },
                {
                    status: 404,
                }
            );

        }


        /*
        ================================================
        SUCCESS
        ================================================
        */

        return NextResponse.json(
            {
                success: true,
                booking,
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error("GET SINGLE BOOKING ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch booking",
                error: error.message,
            },
            {
                status: 500,
            }
        );

    }

}


/*
====================================================
UPDATE BOOKING
====================================================
*/

export async function PUT(request, { params }) {

    try {

        /*
        ================================================
        CONNECT DATABASE
        ================================================
        */

        await connectDB();


        /*
        ================================================
        ADMIN AUTHENTICATION
        ================================================
        */

        const token = request.cookies.get("admin_token")?.value;

        const admin = verifyAdminToken(token);

        if (!admin) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }


        /*
        ================================================
        GET BOOKING ID
        ================================================
        */

        const { id } = await params;


        /*
        ================================================
        READ REQUEST BODY
        ================================================
        */

        const body = await request.json();


        /*
        ================================================
        FIND BOOKING
        ================================================
        */

        const booking = await Booking.findById(id);

        if (!booking) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Booking not found",
                },
                {
                    status: 404,
                }
            );

        }


        /*
        ================================================
        UPDATE CUSTOMER INFORMATION
        ================================================
        */

        if (body.name !== undefined) {

            booking.name = String(body.name).trim();

        }


        if (body.email !== undefined) {

            booking.email = String(body.email).trim().toLowerCase();

        }


        if (body.phone !== undefined) {

            booking.phone = String(body.phone).trim();

        }


        if (body.country !== undefined) {

            booking.country = String(body.country).trim();

        }


        if (body.numberOfPeople !== undefined) {

            const numberOfPeople = Number(body.numberOfPeople);

            if (
                !Number.isInteger(numberOfPeople) ||
                numberOfPeople < 1
            ) {

                return NextResponse.json(
                    {
                        success: false,
                        message: "Number of people must be at least 1",
                    },
                    {
                        status: 400,
                    }
                );

            }

            booking.numberOfPeople = numberOfPeople;

        }


        if (body.preferredDate !== undefined) {

            booking.preferredDate = body.preferredDate;

        }


        if (body.message !== undefined) {

            booking.message = String(body.message).trim();

        }


        /*
        ================================================
        UPDATE STATUS
        ================================================
        */

        if (body.status !== undefined) {

            const allowedStatuses = [
                "pending",
                "confirmed",
                "cancelled",
            ];

            if (!allowedStatuses.includes(body.status)) {

                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid booking status",
                    },
                    {
                        status: 400,
                    }
                );

            }

            booking.status = body.status;

        }


        /*
        ================================================
        RELOAD EXPERIENCE
        ================================================
        */

        const experience = await Page.findById(booking.experience)
            .populate({
                path: "pageType",
                select: "name slug",
            })
            .lean();


        if (!experience) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Associated experience not found",
                },
                {
                    status: 404,
                }
            );

        }


        /*
        ================================================
        GET CURRENT PAGE TYPE
        ================================================
        */

        const pageType = experience.pageType;

        if (!pageType) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Experience page type not found",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ================================================
        MAKE SURE BOOKING TYPE MATCHES PAGE TYPE
        ================================================
        */

        if (
            booking.experienceType &&
            booking.experienceType !== pageType.slug
        ) {

            booking.experienceType = pageType.slug;

        }


        /*
        ================================================
        RECALCULATE PRICE
        ================================================
        */

        const numberOfPeople = booking.numberOfPeople;

        let pricePerPax = 0;


        /*
        -----------------------------------------------
        FIXED PRICE
        -----------------------------------------------
        */

        if (
            experience.price?.pricingType === "fixed"
        ) {

            pricePerPax = Number(
                experience.price?.amount || 0
            );

        }


        /*
        -----------------------------------------------
        PAX BASED PRICE
        -----------------------------------------------
        */

        else if (
            experience.price?.pricingType === "pax_based"
        ) {

            const tiers = experience.price?.paxPrices || [];

            const matchingTier = tiers.find((tier) => {

                const minPax = Number(tier.minPax);

                const maxPax =
                    tier.maxPax === null ||
                    tier.maxPax === undefined ||
                    tier.maxPax === ""
                        ? null
                        : Number(tier.maxPax);

                if (numberOfPeople < minPax) {

                    return false;

                }

                if (
                    maxPax !== null &&
                    numberOfPeople > maxPax
                ) {

                    return false;

                }

                return true;

            });


            if (!matchingTier) {

                return NextResponse.json(
                    {
                        success: false,
                        message:
                            `No pricing tier available for ${numberOfPeople} people`,
                    },
                    {
                        status: 400,
                    }
                );

            }


            pricePerPax = Number(
                matchingTier.pricePerPax || 0
            );

        }


        /*
        ================================================
        VALIDATE PRICE
        ================================================
        */

        if (
            !Number.isFinite(pricePerPax) ||
            pricePerPax <= 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid experience price",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        ================================================
        CALCULATE TOTAL
        ================================================
        */

        const estimatedTotal =
            pricePerPax * numberOfPeople;


        /*
        ================================================
        UPDATE PRICE SNAPSHOT
        ================================================
        */

        booking.packagePrice = pricePerPax;

        booking.packageCurrency =
            experience.price?.currency || "USD";

        booking.packagePriceType =
            experience.price?.pricingType || "fixed";

        booking.estimatedTotal = estimatedTotal;


        /*
        ================================================
        SAVE BOOKING
        ================================================
        */

        await booking.save();


        /*
        ================================================
        GET UPDATED BOOKING
        ================================================
        */

        const updatedBooking =
            await Booking.findById(booking._id)
                .populate({
                    path: "experience",
                    select:
                        "title slug imageUrl pageType region price published",
                    populate: [
                        {
                            path: "pageType",
                            select: "name slug",
                        },
                        {
                            path: "region",
                            select: "name slug",
                        },
                    ],
                })
                .lean();


        /*
        ================================================
        SUCCESS
        ================================================
        */

        return NextResponse.json(
            {
                success: true,
                message: "Booking updated successfully",
                booking: updatedBooking,
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error("UPDATE BOOKING ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update booking",
                error: error.message,
            },
            {
                status: 500,
            }
        );

    }

}


/*
====================================================
DELETE BOOKING
====================================================
*/

export async function DELETE(request, { params }) {

    try {

        /*
        ================================================
        CONNECT DATABASE
        ================================================
        */

        await connectDB();


        /*
        ================================================
        ADMIN AUTHENTICATION
        ================================================
        */

        const token = request.cookies.get("admin_token")?.value;

        const admin = verifyAdminToken(token);

        if (!admin) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }


        /*
        ================================================
        GET BOOKING ID
        ================================================
        */

        const { id } = await params;


        /*
        ================================================
        FIND BOOKING
        ================================================
        */

        const booking = await Booking.findById(id);

        if (!booking) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Booking not found",
                },
                {
                    status: 404,
                }
            );

        }


        /*
        ================================================
        DELETE
        ================================================
        */

        await Booking.findByIdAndDelete(id);


        /*
        ================================================
        SUCCESS
        ================================================
        */

        return NextResponse.json(
            {
                success: true,
                message: "Booking deleted successfully",
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error("DELETE BOOKING ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete booking",
                error: error.message,
            },
            {
                status: 500,
            }
        );

    }

}