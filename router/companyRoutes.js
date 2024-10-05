import express from "express";
import {
  registerJob,
  updateJob,
  deleteJob,
  getAllJobs,
  getJobById
} from "../controller/companyRegister.js"; // Adjust the path as necessary

const router = express.Router();

// Register a new job
router.post("/", registerJob);

// Update job details
router.put("/update/:id", updateJob);

// Delete a job
router.delete("/delete/:id", deleteJob);

router.get("/all", getAllJobs);
router.get("/get/:id", getJobById);

export default router;
