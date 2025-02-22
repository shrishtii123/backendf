import Application from "../models/applicationSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Upload files to Cloudinary
const uploadToCloudinary = async (file) => {
  return await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "applications",
    resource_type: "auto",
  });
};

// 📌 Submit Application with PDF Uploads
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { title, description, category, email, name, profession } = req.body;

  if (!title || !description || !category || !email || !name || !profession) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  const newApplication = new Application({
    title,
    description,
    category,
    applicant: { email, name, profession },
  });

  // Upload PDFs if available
  if (req.files && req.files.pdfs) {
    const files = Array.isArray(req.files.pdfs) ? req.files.pdfs : [req.files.pdfs];

    for (const file of files) {
      const uploadedFile = await uploadToCloudinary(file);
      newApplication.pdfs.push({
        public_id: uploadedFile.public_id,
        url: uploadedFile.secure_url,
        uploadedBy: email,
      });
    }
  }

  await newApplication.save();

  res.status(201).json({
    success: true,
    message: "Application submitted successfully!",
    application: newApplication,
  });
});

// 📌 Update Application

dotenv.config();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Or use SMTP settings for other services
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.PASSWORD, // Your email password or app password
  },
});

// Function to send email
const sendStatusChangeEmail = async (email, name, title, role, status) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Application Status Update: ${title}`,
      html: `
        <p>Dear ${name},</p>
        <p>Your application <strong>${title}</strong> has been <strong>${status}</strong> by <strong>${role}</strong>.</p>
        <p>Thank you.</p>
      `,
    });
    console.log(`Status change email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const updateApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { role, status, approvedBy } = req.body;

  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  let previousStatus;

  // Update the status based on the role
  if (role === "faculty") {
    previousStatus = application.facultyStatus;
    application.facultyStatus = status;
    application.approvals.faculty = { approvedBy, approvedAt: new Date() };
  } else if (role === "dean") {
    previousStatus = application.deanStatus;
    application.deanStatus = status;
    application.approvals.dean = { approvedBy, approvedAt: new Date() };
  } else if (role === "director") {
    previousStatus = application.directorStatus;
    application.directorStatus = status;
    application.approvals.director = { approvedBy, approvedAt: new Date() };
  } else {
    return next(new ErrorHandler("Invalid role", 400));
  }

  await application.save();

  // Send email notification if status changed
  if (previousStatus !== status) {
    await sendStatusChangeEmail(
      application.applicant.email,
      application.applicant.name,
      application.title,
      role,
      status
    );
  }

  res.status(200).json({
    success: true,
    message: `Application ${status} by ${role}`,
    application,
  });
});


// 📌 Delete Application and Remove PDFs from Cloudinary
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  // Delete PDFs from Cloudinary
  for (const pdf of application.pdfs) {
    await cloudinary.v2.uploader.destroy(pdf.public_id);
  }

  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: "Application deleted successfully!",
  });
});

// 📌 Get All Applications
export const getAllApplications = catchAsyncErrors(async (req, res, next) => {
  const applications = await Application.find();
  res.status(200).json({
    success: true,
    applications,
  });
});

// 📌 Get Application by ID
export const getApplicationById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  res.status(200).json({
    success: true,
    application,
  });
});

// 📌 Approve or Reject Application
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { role, status, approvedBy } = req.body; // role = "faculty", "dean", "director"

  if (!["faculty", "dean", "director"].includes(role) || !["Approved", "Rejected"].includes(status)) {
    return next(new ErrorHandler("Invalid role or status!", 400));
  }

  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  application[`${role}Status`] = status;
  application.approvals[role] = { approvedBy, approvedAt: new Date() };

  await application.save();

  res.status(200).json({
    success: true,
    message: `Application ${status.toLowerCase()} by ${role}!`,
    application,
  });
});
