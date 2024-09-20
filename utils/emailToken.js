import jwt from 'jsonwebtoken';

// Function to generate JWT token
export const generateTokenByEmail = async (jobApplication, res) => {
  const token = jobApplication.generateJsonWebToken(); // Use the method from the job application schema
  // Set the token in the response headers or send it back in the response body
  res.setHeader('Authorization', `Bearer ${token}`);
};
