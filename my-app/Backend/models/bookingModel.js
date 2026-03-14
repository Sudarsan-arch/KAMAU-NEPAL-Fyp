import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional"
    },
    serviceTitle: {
      type: String,
      required: true
    },
    serviceProvider: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    workDescription: {
      type: String,
      required: true
    },
    timeSchedule: {
      type: String,
      required: true
    },
    bookingDate: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    hourlyRate: {
      type: String,
      default: "रू 0.00"
    },
    totalCost: {
      type: String,
      default: "रू 0.00"
    },
    rating: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"],
      default: "Pending"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
