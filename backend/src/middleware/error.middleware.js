import env from '../config/env.js';

// Centralized error handler. Any error passed to next(err) anywhere
// in the app ends up here. Distinguishes "operational" errors (AppError,
// expected — bad input, not found, unauthorized) from unexpected bugs,
// and never leaks stack traces or raw driver errors in production.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already in use`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose invalid ObjectId cast
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  if (env.nodeEnv === 'development' && !err.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode === 500 && env.nodeEnv === 'production' ? 'Internal server error' : message,
    },
  });
};

export default errorHandler;