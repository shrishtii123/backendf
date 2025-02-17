import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  email: { type: String, required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true }, // Format: HH:MM
  endTime: { type: String, required: true }, // Format: HH:MM
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  bookings: [BookingSchema], // Embedded bookings
});

export const Facility = mongoose.model("Facility", FacilitySchema);
export const Booking = mongoose.model("Booking", BookingSchema);
