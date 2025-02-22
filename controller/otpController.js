import nodemailer from "nodemailer";
import { Otp } from "../models/otpSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import dotenv from "dotenv";
import { generateToken } from "../utils/jwtToken.js";

dotenv.config();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please provide an email address!", 400));
  }

  if (!email.endsWith("@sggs.ac.in")) {
    return next(new ErrorHandler("Restricted access! Please use your college email ID.", 403));
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  let userOtp = await Otp.findOne({ email });
  if (!userOtp) {
    userOtp = new Otp({ email, otp, otpExpires });
  } else {
    userOtp.otp = otp;
    userOtp.otpExpires = otpExpires;
  }
  await userOtp.save();

  // Gmail SMTP configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, 
    requireTLS: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD, // Use an App Password here
    },
    tls: {
      rejectUnauthorized: false, // Fixes self-signed certificate error
    },
  });
  
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify Email",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
    });
  } catch (error) {
    console.error("Error sending email: ", error);
    return next(new ErrorHandler("Failed to send OTP email, use college email id", 500));
  }
});

export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Please provide email and OTP!", 400));
  }

  const userOtp = await Otp.findOne({ email, otp });

  if (!userOtp || userOtp.otpExpires < Date.now()) {
    return next(new ErrorHandler("Invalid or expired OTP!", 400));
  }

  await Otp.deleteOne({ email });
  console.log('done');
  
  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
  console.log('done');
});
