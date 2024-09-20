import express from "express";
import {
  deleteJobApplication,
  getAllJobApplications,
  postJobApplication,
  updateJobApplication,
  getJobApplicationDetail,
  getJobApplicationByEmail
} from "../controller/jobApplicationController.js";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
// import { verifyToken } from '../utils/jwtToken.js';
// import { JobApplication } from '../models/jobApplicationSchema.js';
// import ErrorHandler from '../middlewares/error.js';

// export const isStudentAuthenticated = catchAsyncErrors(async (req, res, next) => {
//   const token = req.cookies?.emailToken || req.header('Authorization')?.replace('Bearer ', '');
//   if (!token) {
//     return next(new ErrorHandler("Student is not authenticated!", 401));
//   }

//   try {
//     const decoded = verifyToken(token);
//     console.log(decoded);
//     const jobApplication = await JobApplication.findById(decoded.id);
//     console.log(jobApplication);
//     if (!jobApplication || jobApplication.email !== req.params.email) {
//       return next(new ErrorHandler("Not authorized for this resource!", 403));
//     }
    
//     next();
//   } catch (error) {
//     return next(new ErrorHandler("Invalid or expired token!", 401));
//   }
// });

const router = express.Router();

// Route to post a new job application
router.post("/post", postJobApplication);

// Route to get all job applications
router.get("/getall", getAllJobApplications);

// Route to update an existing job application
router.put("/update/:id", updateJobApplication);

// Route to delete a job application
router.delete("/delete/:id", deleteJobApplication);

// Route to get the details of a job application by registration number
router.get("/detail/:reg", getJobApplicationDetail);

// Route to get job application details by email (authenticated route)
router.get('/details/:email', getJobApplicationByEmail);

export default router;
