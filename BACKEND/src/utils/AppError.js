class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Optional machine-readable error code
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
