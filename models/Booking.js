import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    /*
    ========================================
    EXPERIENCE
    ========================================
    */

    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },

    /*
    ========================================
    EXPERIENCE TYPE
    ========================================
    
    This is stored as a snapshot of the Page Type
    at the time of booking.

    It is NOT restricted to trek/tour.

    Examples:
    trek
    tour
    climbing
    adventure
    expedition
    hiking
    etc.

    Future Page Types can also be used.
    ========================================
    */

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

    /*
    ========================================
    PRICE SNAPSHOT
    ========================================
    
    These values are copied from the Page when
    the booking is created.

    This protects the booking from future
    price changes.
    ========================================
    */

    packagePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    packageCurrency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
    },

    packagePriceType: {
      type: String,
      enum: ["fixed", "pax_based"],
      default: "fixed",
    },

    estimatedTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    ========================================
    CUSTOMER
    ========================================
    */

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

    /*
    ========================================
    BOOKING DETAILS
    ========================================
    */

    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },

    preferredDate: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    acceptTerms: 
    { type: Boolean, 
      default: false,
      required: true,
     },

    /*
    ========================================
    STATUS
    ========================================
    */

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

/*
=========================================
BOOKING MODEL
=========================================
*/

const Booking =
  mongoose.models.Booking ||
  mongoose.model(
    "Booking",
    bookingSchema
  );

export default Booking;