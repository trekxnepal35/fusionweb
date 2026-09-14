import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    // ================================
    // EXPERIENCE
    // ================================

    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },

    experienceType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    experienceTitle: {
      type: String,
      required: true,
      trim: true,
    },

    // ================================
    // CUSTOMER INFORMATION
    // ================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    // ================================
    // TRIP INFORMATION
    // ================================

    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },

    preferredDate: {
      type: Date,
      default: null,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    // ================================
    // ENQUIRY STATUS
    // ================================

    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry =
  mongoose.models.Enquiry ||
  mongoose.model("Enquiry", EnquirySchema);

export default Enquiry;