import { JobApplication } from "../models/jobApplicationSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import cloudinary from 'cloudinary';
import { generateTokenByEmail } from "../utils/emailToken.js";
import { generateToken } from "../utils/jwtToken.js";
import jwt from 'jsonwebtoken';

// Function to upload files to Cloudinary
const uploadToCloudinary = async (file) => {
  return await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "jobApplications",
  });
};

// Mock database to store OTPs for simplicity (same as in otpController.js)
const otpDatabase = {};

export const postJobApplication = catchAsyncErrors(async (req, res, next) => {
  const {
    reg,
    fullName,
    email,
    parentemail,
    heademail,
    phone,
    cgpa,
    dob,
    gender,
    ssc,
    hsc,
    projects,
    internship,
    branch,
    address,
    skills,
    references,
    gap_year,
    backlogs
    // otp
  } = req.body;

  // Verify OTP
  // if (!otpDatabase[email] || otpDatabase[email] !== parseInt(otp)) {
  //   return next(new ErrorHandler("Invalid or missing OTP", 400));
  // }

  // Check for missing fields
  if (
    !reg ||
    !fullName ||
    !email ||
    !parentemail ||
    !heademail ||
    !phone ||
    !cgpa ||
    !dob ||
    !gender ||
    !ssc ||
    !hsc ||
    !projects ||
    !branch ||
    !address ||
    !skills ||
    !references ||
    !backlogs
  ) {
    return next(new ErrorHandler("Please fill out the entire form!", 400));
  }

  const jobApplication = new JobApplication({
    reg,
    fullName,
    email,
    parentemail,
    heademail,
    phone,
    cgpa,
    dob,
    gender,
    ssc,
    hsc,
    projects,
    internship,
    branch,
    address,
    skills,
    references,
    gap_year,
    backlogs
  });

  // Upload proofs if available
  if (req.files && req.files.cgpaProof) {
    const cgpaProofUpload = await uploadToCloudinary(req.files.cgpaProof);
    jobApplication.cgpaProof = {
      public_id: cgpaProofUpload.public_id,
      url: cgpaProofUpload.secure_url,
    };
  }

  if (req.files && req.files.sscProof) {
    const sscProofUpload = await uploadToCloudinary(req.files.sscProof);
    jobApplication.sscProof = {
      public_id: sscProofUpload.public_id,
      url: sscProofUpload.secure_url,
    };
  }

  if (req.files && req.files.hscProof) {
    const hscProofUpload = await uploadToCloudinary(req.files.hscProof);
    jobApplication.hscProof = {
      public_id: hscProofUpload.public_id,
      url: hscProofUpload.secure_url,
    };
  }

  if (req.files && req.files.internshipProof) {
    const internshipProofUpload = await uploadToCloudinary(req.files.internshipProof);
    jobApplication.internshipProof = {
      public_id: internshipProofUpload.public_id,
      url: internshipProofUpload.secure_url,
    };
  }
  
  if (req.files && req.files.gap_yearProof) {
    const gap_yearProofUpload = await uploadToCloudinary(req.files.gap_yearProof);
    jobApplication.gap_yearProof = {
      public_id: gap_yearProofUpload.public_id,
      url: gap_yearProofUpload.secure_url,
    };
  }

  if (req.files && req.files.profilePhotoProof) {
    const profilePhotoProofUpload = await uploadToCloudinary(req.files.profilePhotoProof);
    jobApplication.profilePhotoProof = {
      public_id: profilePhotoProofUpload.public_id,
      url: profilePhotoProofUpload.secure_url,
    };
  }

  await jobApplication.save();
  

  res.status(200).json({
    success: true,
    jobApplication,
    message: "Job Application Submitted!",
  });

  // Remove OTP after successful application submission
  // delete otpDatabase[email];
});

export const updateJobApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    reg,
    fullName,
    email,
    parentemail,
    heademail,
    phone,
    cgpa,
    dob,
    gender,
    ssc,
    hsc,
    projects,
    internship,
    branch,
    address,
    skills,
    references,
    gap_year,
    placed,
    amount,
    backlogs,
    status,
    message,
    verificationUpdates // New field for verification updates
  } = req.body;

  const jobApplication = await JobApplication.findById(id);
  if (!jobApplication) {
    return next(new ErrorHandler("Job Application Not Found!", 404));
  }

  jobApplication.reg = reg || jobApplication.reg;
  jobApplication.fullName = fullName || jobApplication.fullName;
  jobApplication.email = email || jobApplication.email;
  jobApplication.parentemail = parentemail || jobApplication.parentemail;
  jobApplication.heademail = heademail || jobApplication.heademail;
  jobApplication.phone = phone || jobApplication.phone;
  jobApplication.cgpa = cgpa || jobApplication.cgpa;
  jobApplication.dob = dob || jobApplication.dob;
  jobApplication.gender = gender || jobApplication.gender;
  jobApplication.ssc = ssc || jobApplication.ssc;
  jobApplication.hsc = hsc || jobApplication.hsc;
  jobApplication.projects = projects || jobApplication.projects;
  jobApplication.internship = internship || jobApplication.internship;
  jobApplication.branch = branch || jobApplication.branch;
  jobApplication.address = address || jobApplication.address;
  jobApplication.skills = skills || jobApplication.skills;
  jobApplication.references = references || jobApplication.references;
  jobApplication.gap_year = gap_year || jobApplication.gap_year;
  jobApplication.placed = placed || jobApplication.placed;
  jobApplication.amount = amount || jobApplication.amount;
  jobApplication.backlogs = backlogs || jobApplication.backlogs;
  jobApplication.status = status || jobApplication.status;
  jobApplication.message = message || jobApplication.message;


  // Upload and update proofs if available
  if (req.files && req.files.cgpaProof) {
    await cloudinary.v2.uploader.destroy(jobApplication.cgpaProof.public_id);
    const cgpaProofUpload = await uploadToCloudinary(req.files.cgpaProof);
    jobApplication.cgpaProof = {
      public_id: cgpaProofUpload.public_id,
      url: cgpaProofUpload.secure_url,
    };
  }

  if (req.files && req.files.sscProof) {
    await cloudinary.v2.uploader.destroy(jobApplication.sscProof.public_id);
    const sscProofUpload = await uploadToCloudinary(req.files.sscProof);
    jobApplication.sscProof = {
      public_id: sscProofUpload.public_id,
      url: sscProofUpload.secure_url,
    };
  }

  if (req.files && req.files.hscProof) {
    await cloudinary.v2.uploader.destroy(jobApplication.hscProof.public_id);
    const hscProofUpload = await uploadToCloudinary(req.files.hscProof);
    jobApplication.hscProof = {
      public_id: hscProofUpload.public_id,
      url: hscProofUpload.secure_url,
    };
  }

  if (req.files && req.files.internshipProof){
    // await cloudinary.v2.uploader.destroy(jobApplication.internshipProof.public_id);
    const internshipProofUpload = await uploadToCloudinary(req.files.internshipProof);
    jobApplication.internshipProof = {
      public_id: internshipProofUpload.public_id,
      url: internshipProofUpload.secure_url,
    };
  }
  
  if (req.files && req.files.gap_yearProof) {
    // await cloudinary.v2.uploader.destroy(jobApplication.gap_yearProof.public_id);
    const gap_yearProofUpload = await uploadToCloudinary(req.files.gap_yearProof);
    jobApplication.gap_yearProof = {
      public_id: gap_yearProofUpload.public_id,
      url: gap_yearProofUpload.secure_url,
    };
  }
  if (req.files && req.files.profilePhotoProof) {
    await cloudinary.v2.uploader.destroy(jobApplication.profilePhotoProof.public_id);
    const profilePhotoProofUpload = await uploadToCloudinary(req.files.profilePhotoProof);
    jobApplication.profilePhotoProof = {
      public_id: profilePhotoProofUpload.public_id,
      url: profilePhotoProofUpload.secure_url,
    };
  }

  // Update verification status if provided
  if (verificationUpdates) {
    Object.keys(verificationUpdates).forEach(field => {
      if (jobApplication[field] && jobApplication[field].verification) {
        jobApplication[field].verification.isVerified = verificationUpdates[field].isVerified;
        jobApplication[field].verification.verifiedBy = verificationUpdates[field].verifiedBy;
        jobApplication[field].verification.verifiedAt = new Date();
      }
    });
  }

  await jobApplication.save();

  res.status(200).json({
    success: true,
    jobApplication,
    message: "Job Application Updated!",
  });
});

// The remaining CRUD operations code...

export const getAllJobApplications = catchAsyncErrors(async (req, res, next) => {
  const jobApplications = await JobApplication.find();
  res.status(200).json({
    success: true,
    jobApplications,
  });
});

export const getJobApplicationDetail = catchAsyncErrors(async (req, res, next) => {
  const { reg } = req.params;
  const jobApplication = await JobApplication.findOne({ reg });
  if (!jobApplication) {
    return next(new ErrorHandler("Job Application Not Found!", 404));
  }
  res.status(200).json({
    success: true,
    jobApplication,
  });
});

export const deleteJobApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const jobApplication = await JobApplication.findById(id);
  if (!jobApplication) {
    return next(new ErrorHandler("Job Application Not Found!", 404));
  }
  await cloudinary.v2.uploader.destroy(jobApplication.cgpaProof.public_id);
  await cloudinary.v2.uploader.destroy(jobApplication.sscProof.public_id);
  await cloudinary.v2.uploader.destroy(jobApplication.hscProof.public_id);
  await cloudinary.v2.uploader.destroy(jobApplication.internshipProof.public_id);
  await cloudinary.v2.uploader.destroy(jobApplication.gap_yearProof.public_id);
  await cloudinary.v2.uploader.destroy(jobApplication.profilePhotoProof.public_id);
  await jobApplication.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Application Deleted!",
  });
});

export const getJobApplicationByEmail = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.params;

  try {
    const jobApplication = await JobApplication.findOne({ email });
    if (!jobApplication) {
      return next(new ErrorHandler("Job Application Not Found!", 404));
    }

    
    res.
    status(200)
   
    .json({
      success: true,
      jobApplication,
    });
  } catch (error) {
    console.error("Error fetching job application:", error);
    return next(new ErrorHandler("An error occurred while fetching the job application", 500));
  }
});
