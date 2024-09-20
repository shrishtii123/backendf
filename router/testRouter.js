import express from "express";
import { createTest, addQuestionToTest, getQuestionsForTest, registerUserAndSelectTest, submitUserResponses } from "../controller/testController.js"; // Adjust the import path as necessary
import { Test } from "../models/testSchema.js";

const router = express.Router();

// Route for admin to create a test
router.post("/admin/create-test", createTest);

// Route for admin to add questions to a specific test
router.post("/admin/add-question/:testId", addQuestionToTest);
;
router.post("/register", registerUserAndSelectTest);
router.get("/test/:testId/questions", getQuestionsForTest);
router.post("/submit-responses", submitUserResponses);
router.get("/tests", async (req, res) => {
    try {
      // Retrieve all tests from the database
      const tests = await Test.find().select("test_name description"); // Select fields to return
  
      // Send the list of tests to the client
      res.status(200).json({ tests });
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ message: "Server error. Could not fetch tests." });
    }
  });

// Route for user to fill info and take test


export default router;
