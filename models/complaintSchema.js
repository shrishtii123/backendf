import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String, // Store media URLs (e.g., Cloudinary)
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    adminVotes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Format Complaint Data
complaintSchema.methods.getComplaintData = function () {
  return {
    _id: this._id, // Include ID for frontend updates
    description: this.description,
    media: this.media,
    adminVotes: this.adminVotes,
    status: this.status,
    studentName: this.isAnonymous && this.adminVotes < 2 ? "Anonymous" : this.studentName,
    studentEmail: this.isAnonymous && this.adminVotes < 2 ? "Hidden" : this.studentEmail,
    createdAt: this.createdAt,
  };
};

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
