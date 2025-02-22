import Cheater from "../models/cheaterSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// 📌 Upload Media to Cloudinary
const uploadToCloudinary = async (file) => {
  const uploadedFile = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "cheaters_proofs",
    resource_type: "auto",
  });
  return uploadedFile.secure_url;
};

// 📌 Add a Cheater
export const addCheater = catchAsyncErrors(async (req, res, next) => {
  const { name, studentId, reason, reportedBy } = req.body;

  if (!name || !studentId || !reason || !reportedBy || !req.files || !req.files.proof) {
    return next(new ErrorHandler("All fields and proof are required!", 400));
  }

  const proofUrl = await uploadToCloudinary(req.files.proof);

  const cheater = await Cheater.create({
    name,
    studentId,
    reason,
    reportedBy,
    proof: proofUrl,
  });

  res.status(201).json({ success: true, message: "Cheater reported!", cheater });
});

// 📌 Get All Cheaters
export const getCheaters = catchAsyncErrors(async (req, res, next) => {
  const cheaters = await Cheater.find();
  res.status(200).json({ success: true, cheaters });
});
