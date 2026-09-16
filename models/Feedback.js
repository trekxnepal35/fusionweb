import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    // =========================================
    // RELATED PAGE / EXPERIENCE
    // =========================================

    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },

    // =========================================
    // CUSTOMER INFORMATION
    // =========================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    // =========================================
    // RATING
    // =========================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // =========================================
    // COMMENT
    // =========================================

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // =========================================
    // STATUS
    // =========================================

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Feedback =
  mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);

export default Feedback;