import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      default: null,
    },

    order: {
      type: Number,
      default: 0,
    },

    target: {
      type: String,
      enum: ["_self", "_blank"],
      default: "_self",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Menu =
  mongoose.models.Menu ||
  mongoose.model("Menu", menuSchema);

export default Menu;