import Complaint from "../models/complaintSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// 📌 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📌 Upload Media to Cloudinary
const uploadToCloudinary = async (file) => {
  const uploadedFile = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "complaints",
    resource_type: "auto", // Handles images/videos
  });
  return uploadedFile.secure_url;
};

// 📌 Create Complaint
export const createComplaint = catchAsyncErrors(async (req, res, next) => {
  const { studentName, studentEmail, description, isAnonymous } = req.body;

  if (!description) {
    return next(new ErrorHandler("Description is required!", 400));
  }

  let mediaUrl = "";
  if (req.files && req.files.media) {
    mediaUrl = await uploadToCloudinary(req.files.media);
  }

  const complaint = await Complaint.create({
    studentName,
    studentEmail,
    description,
    media: mediaUrl,
    isAnonymous,
  });

  res.status(201).json({ success: true, message: "Complaint registered!", complaint });
});

// 📌 Get All Complaints
export const getComplaints = catchAsyncErrors(async (req, res, next) => {
  const complaints = await Complaint.find();
  const formattedComplaints = complaints.map((c) => c.getComplaintData());

  res.status(200).json({ success: true, complaints: formattedComplaints });
});

// 📌 Vote for Complaint
export const voteComplaint = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Get complaint ID from URL

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        return next(new ErrorHandler("Complaint not found!", 404));
    }

    complaint.adminVotes += 1;
    await complaint.save();

    res.status(200).json({
        success: true,
        message: "Vote recorded!",
        complaint: complaint.getComplaintData(),
    });
});

  
  // 📌 Update Complaint Status Without _id
  export const updateComplaintStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Get complaint ID from URL
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
        return next(new ErrorHandler("Invalid status value!", 400));
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        return next(new ErrorHandler("Complaint not found!", 404));
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({
        success: true,
        message: "Complaint status updated!",
        complaint: complaint.getComplaintData(),
    });
});


  
  // 📌 Delete Complaint Without _id
  export const deleteComplaint = catchAsyncErrors(async (req, res, next) => {
    const { studentEmail, createdAt } = req.body;
  
    const complaint = await Complaint.findOne({ studentEmail, createdAt });
    if (!complaint) {
      return next(new ErrorHandler("Complaint not found!", 404));
    }
  
    // Delete media from Cloudinary
    if (complaint.media.length > 0) {
      for (const mediaUrl of complaint.media) {
        const publicId = mediaUrl.split("/").pop().split(".")[0]; // Extract Cloudinary public ID
        await cloudinary.uploader.destroy(`complaints/${publicId}`);
      }
    }
  
    await complaint.deleteOne();
  
    res.status(200).json({ success: true, message: "Complaint deleted successfully!" });
  });