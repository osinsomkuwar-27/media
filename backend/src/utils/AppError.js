// Custom error class so we can distinguish "expected" operational errors
// (bad input, not found, unauthorized) from unexpected bugs. The error
// middleware (added in a later phase) will use `isOperational` to decide
// whether to return a clean message or a generic 500.
class AppError extends Error {
  constructor(message, statusCode, code = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;