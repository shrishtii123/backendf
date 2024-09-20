import { Test,Question,UserResponse,User } from "../models/testSchema.js";  

export const createTest = async (req, res) => {
  try {
    const { testName, description } = req.body;

    if (!testName) {
      return res.status(400).json({ message: "Test name is required." });
    }

    // Create a new test
    const newTest = new Test({
      test_name: testName,
      description: description || "",
    });

    // Save the test
    await newTest.save();

    res.status(201).json({ message: "Test created successfully!", test: newTest });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ message: "Server error. Could not create the test." });
  }
};


export const addQuestionToTest = async (req, res) => {
  try {
    const { testId, questionText, options, correctOption } = req.body;

    if (!testId || !questionText || !options || options.length !== 4 || !correctOption) {
      return res.status(400).json({ message: "All fields are required, and options must be an array of 4 items." });
    }

    // Create a new question
    const newQuestion = new Question({
      question_text: questionText,
      options: options,
      correct_option: correctOption,
    });

    // Save the question
    await newQuestion.save();

    // Find the test by ID and add the new question to it
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    // Add the question to the test's question list
    test.questions.push(newQuestion._id);

    // Save the updated test
    await test.save();

    res.status(200).json({ message: "Question added successfully!", test });
  } catch (error) {
    console.error("Error adding question to test:", error);
    res.status(500).json({ message: "Server error. Could not add question to the test." });
  }
};
 // Assuming your schema is in this file





// User Registration and Test Selection
export const registerUserAndSelectTest = async (req, res) => {
  try {
    const { firstName, lastName, email, branch, regNo, testId } = req.body;

    if (!firstName || !lastName || !email || !branch || !regNo || !testId) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if the test exists
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    // Create a new user
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      branch,
      reg_no: regNo,
    });

    // Save the user
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!", user: newUser, selectedTest: test });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error. Could not register user." });
  }
};
// Get Questions for a Selected Test
export const getQuestionsForTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // Find the test with populated questions
    const test = await Test.findById(testId).populate("questions");
    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    res.status(200).json({ testName: test.test_name, questions: test.questions });
  } catch (error) {
    console.error("Error fetching questions for test:", error);
    res.status(500).json({ message: "Server error. Could not fetch questions." });
  }
};
// Submit User Responses and Calculate Score
export const submitUserResponses = async (req, res) => {
  try {
    const { userId, testId, responses } = req.body;

    if (!userId || !testId || !responses || responses.length === 0) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Find the user and test
    const user = await User.findById(userId);
    const test = await Test.findById(testId).populate("questions");

    if (!user || !test) {
      return res.status(404).json({ message: "User or Test not found." });
    }

    let score = 0;

    // Iterate through the responses and calculate the score
    responses.forEach((response) => {
      const question = test.questions.find(q => q._id.toString() === response.questionId);
      if (question && question.correct_option === response.answer) {
        score++;
      }
    });

    // Save the user response and score
    const userResponse = new UserResponse({
      user: userId,
      test: testId,
      responses: responses.map(response => ({
        question: response.questionId,
        answer: response.answer,
      })),
    });
    await userResponse.save();

    res.status(200).json({ message: "Responses submitted successfully!", score, totalQuestions: test.questions.length });
  } catch (error) {
    console.error("Error submitting user responses:", error);
    res.status(500).json({ message: "Server error. Could not submit responses." });
  }
};
