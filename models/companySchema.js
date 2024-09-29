import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, "Job title is required!"],
    trim: true,
    minlength: [3, "Job title must be at least 3 characters long!"],
  },
  jobDescription: {
    type: String,
    required: [true, "Job description is required!"],
    trim: true,
  },
  companyName: {
    type: String,
    required: [true, "Company name is required!"],
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  applicationDeadline: {
    type: Date,
    required: [true, "Application deadline is required!"],
  },
  eligibilityCriteria: {
    minCGPA: {
      type: Number,
      required: [true, "Minimum CGPA is required!"],
      min: [0, "Minimum CGPA cannot be less than 0!"],
      max: [10, "Minimum CGPA cannot exceed 10!"],
    },
    minHSCMarks: {
      type: Number,
      required: [true, "Minimum HSC Marks are required!"],
      min: [0, "Minimum HSC Marks cannot be less than 0!"],
      max: [100, "Minimum HSC Marks cannot exceed 100!"],
    },
    minSSCMarks: {
      type: Number,
      required: [true, "Minimum SSC Marks are required!"],
      min: [0, "Minimum SSC Marks cannot be less than 0!"],
      max: [100, "Minimum SSC Marks cannot exceed 100!"],
    },
    maxGapYears: {
      type: Number,
      required: [true, "Maximum Gap Years are required!"],
      min: [0, "Maximum Gap Years cannot be negative!"],
    },
    maxBacklogs: {
      type: Number,
      required: [true, "Maximum Backlogs are required!"],
      min: [0, "Maximum Backlogs cannot be negative!"],
    },
  },
  techStacks: {
      type:[String],
      default:[],
      required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Job = mongoose.model("Job", jobSchema);
