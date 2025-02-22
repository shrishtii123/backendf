import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Event", "Budget", "Sponsorship"],
      required: true,
    },
    applicant: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      profession: { type: String, required: true }, // e.g., "Student", "Faculty"
    },
    facultyStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    deanStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    directorStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvals: {
      faculty: { approvedBy: String, approvedAt: Date },
      dean: { approvedBy: String, approvedAt: Date },
      director: { approvedBy: String, approvedAt: Date },
    },
    priority: { type: Number, default: 0 },
    pdfs: [
      {
        url: { type: String, required: true }, // Cloudinary URL
        public_id: { type: String, required: true }, // Cloudinary Public ID
        uploadedBy: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ priority: -1, createdAt: 1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
