import mongoose from "mongoose";
import validator from "validator";

// Question Schema
const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: [true, "Question text is required!"],
  },
  options: {
    A: {
      type: String,
      required: [true, "Option A is required!"],
    },
    B: {
      type: String,
      required: [true, "Option B is required!"],
    },
    C: {
      type: String,
      required: [true, "Option C is required!"],
    },
    D: {
      type: String,
      required: [true, "Option D is required!"],
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
  user: {
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
  },
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

// Export Models
export const Question = mongoose.model("Question", questionSchema);
export const Test = mongoose.model("Test", testSchema);
