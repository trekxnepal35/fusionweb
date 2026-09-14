import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";
import mongoose from "mongoose";

// PUT API

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await request.json();

    const menu = await Menu.findByIdAndUpdate(
      id,
      {
        title: body.title,
        slug: body.slug,
        parentId: body.parentId || null,
        order: Number(body.order || 0),
        target: body.target || "_self",
        active:
          body.active !== undefined
            ? body.active
            : true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update menu",
      },
      {
        status: 500,
      }
    );
  }
}

// Delete API
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const menu = await Menu.findById(id);

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        {
          status: 404,
        }
      );
    }


    // Check children

    const children = await Menu.countDocuments({
      parentId: id,
    });


    if (children > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete this menu because it has child menus.",
        },
        {
          status: 400,
        }
      );
    }


    await Menu.deleteOne({
      _id: id,
    });


    return NextResponse.json({
      success: true,
      message: "Menu deleted successfully",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete menu",
      },
      {
        status: 500,
      }
    );
  }
}