const Error = (err, req, res, next) => {
    console.error("Error:", err.message); // Debugging log
  
    // Set default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(statusCode).json({
      success: false,
      message: message,
      error: err.stack, // Useful for debugging (remove in production)
    });
  };
  
  export default Error;