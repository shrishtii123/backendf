import mongoose from "mongoose";

const cheaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  reportedBy: { type: String, required: true },
  proofUrls: [{ type: String }], // Array of image/PDF URLs
  dateReported: { type: Date, default: Date.now },
});

export default mongoose.model("Cheater", cheaterSchema);
