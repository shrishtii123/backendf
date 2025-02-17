import { JobApplication } from "../models/jobApplicationSchema.js";
import nodemailer from "nodemailer";

export const updateJobApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { sick, leave } = req.body;

    // Find the job application by ID
    const jobApplication = await JobApplication.findById(id);
    if (!jobApplication) {
      return res.status(404).json({ success: false, message: "Job application not found" });
    }

    // Update sick or leave status
    let emailSent = false;
    let emailMessage = "";
    const timestamp = new Date().toLocaleString();

    if (sick === "Yes" && jobApplication.sick !== "Yes") {
      jobApplication.sick = "Yes";
      emailSent = true;
      emailMessage = `Student ${jobApplication.fullName} (Reg: ${jobApplication.reg}) is reported sick as of ${timestamp}.`;
      await sendEmail(jobApplication.heademail, "Student Sick Notification", emailMessage);
    }

    if (leave === "Yes" && jobApplication.leave !== "Yes") {
      jobApplication.leave = "Yes";
      emailSent = true;
      emailMessage = `Student ${jobApplication.fullName} (Reg: ${jobApplication.reg}) has left the campus as of ${timestamp}.`;
      await sendEmail(jobApplication.parentemail, "Student Leave Notification", emailMessage);
    }

    await jobApplication.save();

    res.status(200).json({
      success: true,
      message: emailSent ? "Status updated & email sent successfully" : "Status updated successfully",
      jobApplication,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Function to send email notifications
const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // Your email (set in .env)
        pass: process.env.PASSWORD, // Your email password (set in .env)
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
  }
};
