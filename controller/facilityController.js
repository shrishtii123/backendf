import { Facility } from "../models/facilitySchema.js";
import nodemailer from "nodemailer";

/** ✅ Add a New Facility */
export const addFacility = async (req, res) => {
  try {
    const { name, description } = req.body;

    const facility = new Facility({ name, description, bookings: [] });
    await facility.save();

    res.status(201).json({ message: "Facility created successfully", facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** ✅ Get All Facilities */
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// import { Facility } from "../models/facilitySchema.js";

/** ✅ Book a Facility */
export const bookFacility = async (req, res) => {
  try {
    const { email, facilityId, date, startTime, endTime } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    // Check for overlapping approved bookings
    const isConflict = facility.bookings.some(
      (booking) =>
        booking.date === date &&
        booking.status === "approved" &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime))
    );

    if (isConflict) return res.status(400).json({ message: "Time slot already booked" });

    const newBooking = {
      email: email,
      facility: facilityId,
      date,
      startTime,
      endTime,
      status: "pending", // Needs admin approval
    };

    facility.bookings.push(newBooking);
    await facility.save();

    res.status(201).json({ message: "Booking request submitted", booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** ✅ Get Approved Bookings (Timeline) */
export const getFacilityBookings = async (req, res) => {
  try {
    const { facilityId, date } = req.params;
    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    const bookings = facility.bookings.filter(booking => booking.date === date && booking.status === "approved");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/** ✅ Request a Facility Booking */
export const requestBooking = async (req, res) => {
    try {
      const { email, facilityName, date, startTime, endTime } = req.body;
  
      // Find facility by name (case-insensitive)
      const facility = await Facility.findOne({ name: { $regex: new RegExp(`^${facilityName}$`, "i") } });
      if (!facility) return res.status(404).json({ message: "Facility not found" });
  
      // Check for overlapping approved bookings
      const isConflict = facility.bookings.some(
        (booking) =>
          booking.date === date &&
          booking.status === "approved" &&
          ((startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime))
      );
  
      if (isConflict) return res.status(400).json({ message: "Time slot already booked" });
  
      // Create new booking request
      const newBooking = {
        email,
        facility: facility._id, // Store facility ID internally
        date,
        startTime,
        endTime,
        status: "pending", // Requires admin approval
      };
  
      facility.bookings.push(newBooking);
      await facility.save();
  
      res.status(201).json({ message: "Booking request submitted", booking: newBooking });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

/** ✅ Get All Booking Requests (Pending & Approved) */
export const getAllBookingRequests = async (req, res) => {
  try {
    const facilities = await Facility.find({}, "name bookings");
    
    // Flatten bookings and include facility name
    const allBookings = facilities.flatMap(facility =>
      facility.bookings.map(booking => ({
        ...booking.toObject(),
        facilityName: facility.name,
      }))
    );

    res.json(allBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/** ✅ Change Booking Status */
export const updateBookingStatus = async (req, res) => {
    try {
      const { bookingId, status } = req.body;
  
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
  
      // Find the facility containing the booking
      const facility = await Facility.findOne({ "bookings._id": bookingId });
      if (!facility) return res.status(404).json({ message: "Booking not found" });
  
      // Find and update the booking status
      const booking = facility.bookings.id(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
  
      booking.status = status;
      await facility.save();
  
      // Send Email Notification
      await sendEmailNotification(booking.email, facility.name, booking.date, booking.startTime, booking.endTime, status);
  
      res.json({ message: `Booking ${status}`, booking });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // ✅ Function to send email notification
  const sendEmailNotification = async (userEmail, facilityName, date, startTime, endTime, status) => {
    try {
      // Configure the email transport
      const transporter = nodemailer.createTransport({
        service: "Gmail", // Use Gmail or any other SMTP service
        auth: {
            user: process.env.EMAIL, // Your email (set in .env)
            pass: process.env.PASSWORD, // Your email password (set in .env)
        },
      });
  
      const subject = status === "approved" ? "🎉 Booking Approved!" : "❌ Booking Rejected";
      const message =
        status === "approved"
          ? `Your booking for ${facilityName} on ${date} from ${startTime} to ${endTime} has been approved! ✅`
          : `Sorry, your booking for ${facilityName} on ${date} from ${startTime} to ${endTime} has been rejected. ❌`;
  
      // Send email
      await transporter.sendMail({
        from: '"Campus Facility" <your-email@gmail.com>', // Sender name & email
        to: userEmail, // Receiver email
        subject: subject,
        text: message,
      });
  
      console.log(`📧 Email sent to ${userEmail}: ${subject}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  };
  
