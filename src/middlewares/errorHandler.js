// src/middlewares/errorHandler.js
/* eslint-disable no-unused-vars */
// Basic error handling middleware
// This middleware will catch errors passed by next(err) or thrown in async routes
// if you are using a wrapper like express-async-errors.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  // If the error is a known type (e.g., from multer or a custom error)
  // you can handle it specifically.
  if (err.message === 'Only Markdown (.md) files are allowed') {
    return res.status(400).json({
      message: 'File upload error',
      error: err.message,
    });
  }

  // For Multer errors (e.g., file too large, etc.)
  if (err.code && err.code.startsWith('LIMIT_')) {
    return res.status(400).json({
      message: 'File upload error',
      error: `File upload limit exceeded: ${err.field}`,
    });
  }

  // Default to a 500 server error if the error is not specifically handled
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
    // Optionally, include the error stack in development for easier debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
