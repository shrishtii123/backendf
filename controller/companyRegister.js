import { Job } from "../models/companySchema.js"; // Ensure this path is correct
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

// Register a new job
export const registerJob = catchAsyncErrors(async (req, res, next) => {
  const {
    jobTitle,
    jobDescription,
    companyName,
    location,
    applicationDeadline,
    eligibilityCriteria,
    techStacks,
  } = req.body;

  // Check for missing fields
  if (
    !jobTitle ||
    !jobDescription ||
    !companyName ||
    !applicationDeadline ||
    !eligibilityCriteria
  ) {
    return next(new ErrorHandler("Please provide all required fields!", 400));
  }

  // Create a new job
  const jobData = {
    jobTitle,
    jobDescription,
    companyName,
    location,
    applicationDeadline,
    eligibilityCriteria,
    techStacks,
  };

  const job = new Job(jobData);
  await job.save();

  res.status(201).json({
    success: true,
    job,
    message: "Job registered successfully!",
  });
});

// Update job details
export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    jobTitle,
    jobDescription,
    companyName,
    location,
    applicationDeadline,
    eligibilityCriteria,
    techStacks,
  } = req.body;

  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  // Update fields if provided
  job.jobTitle = jobTitle || job.jobTitle;
  job.jobDescription = jobDescription || job.jobDescription;
  job.companyName = companyName || job.companyName;
  job.location = location || job.location;
  job.applicationDeadline = applicationDeadline || job.applicationDeadline;
  job.eligibilityCriteria = eligibilityCriteria || job.eligibilityCriteria;
  job.techStacks = techStacks || job.techStacks;

  await job.save();

  res.status(200).json({
    success: true,
    job,
    message: "Job updated successfully!",
  });
});

// Delete a job
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully!",
  });
});


export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find(); // Retrieve all jobs from the database

  if (!jobs || jobs.length === 0) {
    return next(new ErrorHandler("No jobs found!", 404));
  }

  res.status(200).json({
    success: true,
    jobs,
    message: "Jobs retrieved successfully!",
  });
});
