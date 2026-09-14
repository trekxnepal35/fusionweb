
import mongoose from "mongoose";

const pageTypeSchema = new mongoose.Schema(
  {
    /*
    ========================================
    PAGE TYPE NAME
    ========================================
    */

    name: {
      type: String,
      required: true,
      trim: true,
    },


    /*
    ========================================
    PAGE TYPE SLUG
    ========================================
    */

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },


    /*
    ========================================
    DESCRIPTION
    ========================================
    */

    description: {
      type: String,
      default: "",
      trim: true,
    },


    /*
    ========================================
    IMAGE
    ========================================
    */

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },


    /*
    ========================================
    BOOKABLE
    ========================================

    true  = customers can book this type
    false = customers cannot book this type

    Examples:

    Trek       -> true
    Tour       -> true
    Climbing   -> true
    Adventure  -> true
    Blog       -> false
    Gallery    -> false
    */

    bookable: {
      type: Boolean,
      default: true,
    },


    /*
    ========================================
    PUBLISHED
    ========================================
    */

    published: {
      type: Boolean,
      default: true,
    },


    /*
    ========================================
    ORDER
    ========================================
    */

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


const PageType =
  mongoose.models.PageType ||
  mongoose.model("PageType", pageTypeSchema);


export default PageType;

