import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";


// GET API
export async function GET() {
  try {
    console.log("Get Menu")
    await connectDB();

    const menus = await Menu.find()
      .sort({
        order: 1,
        createdAt: 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: menus,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch menus",
      },
      {
        status: 500,
      }
    );

  }
}

// Create POST API
export async function POST(request) {
  try {

    await connectDB();

    const body = await request.json();

    const menu = await Menu.create({
      title: body.title,
      slug: body.slug,
      parentId: body.parentId || null,
      order: Number(body.order || 0),
      target: body.target || "_self",
      active:
        body.active !== undefined
          ? body.active
          : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: menu,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create menu",
      },
      {
        status: 500,
      }
    );

  }
}