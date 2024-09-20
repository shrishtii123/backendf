import nodemailer from "nodemailer";
import { Correction } from "../models/correctionSchema.js";

// Function to send a correction email
export const sendCorrectionEmail = async (req, res) => {
  const { email, field, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ success: false, error: "All fields are required!" });
  }

  try {
    // Save the correction request to the database
    const correction = new Correction({ email, field, message });
    await correction.save();

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
  secure: false, 
  requireTLS: true,
  logger: true,
  debug: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      connectionTimeout: 30000
    });

    // Set up email data
    const mailOptions = {
      from: process.env.EMAIL, // Sender address
      to: email, // Receiver address
      subject: "Correction Required", // Subject line
      text: `Please correct the following field: ${field}\n\nMessage: ${message}`, // Plain text body
    };

    // Send email with defined transporter object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ success: false, error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({ success: true, data: correction });
      }
    });
  } catch (error) {
    console.error("Error saving correction:", error);
    return res.status(500).json({ success: false, error: "Failed to save correction" });
  }
};
// backend/routes/email.js


// Function to send emails to multiple recipients
export const sendBulkEmails = async (req, res) => {
  const { recipients, subject, message } = req.body;

  if (!recipients || recipients.length === 0 || !subject || !message) {
    return res.status(400).json({ success: false, error: "All fields are required!" });
  }

  try {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      logger: true,
      debug: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      connectionTimeout: 30000
    });

    // Set up email data
    const mailOptions = {
      from: process.env.EMAIL, // Sender address
      to: recipients.join(','), // Receiver addresses (comma separated)
      subject: subject, // Subject line
      text: message, // Plain text body
    };

    // Send email with defined transporter object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ success: false, error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({ success: true, message: "Emails sent successfully!" });
      }
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return res.status(500).json({ success: false, error: "Failed to send emails" });
  }
};

