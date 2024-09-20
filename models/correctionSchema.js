import mongoose from "mongoose";
import validator from "validator";

const correctionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required!"],
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  
  message: {
    type: String,
    required: [true, "Message is required!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Correction = mongoose.model("Correction", correctionSchema);
