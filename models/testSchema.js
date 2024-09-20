import mongoose from "mongoose";
import validator from "validator";

// User Schema
const iopSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First name is required!"],
  },
  last_name: {
    type: String,
    required: [true, "Last name is required!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    validate: [validator.isEmail, "Provide a valid email!"],
  },
  branch: {
    type: String,
    required: [true, "Branch is required!"],
  },
  reg_no: {
    type: String,
    required: [true, "Registration number is required!"],
  },
});

// Question Schema
const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: [true, "Question text is required!"],
  },
  options: {
    type: [String], // Array of strings for options
    validate: {
      validator: (v) => v.length === 4, // Ensure there are exactly 4 options
      message: "There must be exactly 4 options!",
    },
  },
  correct_option: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: [true, "Correct option is required!"],
  },
});

// Test Schema
const testSchema = new mongoose.Schema({
  test_name: {
    type: String,
    required: [true, "Test name is required!"],
  },
  description: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Question",
      required: true,
    },
  ],
});

// UserResponse Schema
const userResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Iop",
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  responses: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      answer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true,
      },
    },
  ],
  submitted_at: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("Iop", iopSchema);
export const Question = mongoose.model("Question", questionSchema);
export const Test = mongoose.model("Test", testSchema);
export const UserResponse = mongoose.model("UserResponse", userResponseSchema);
