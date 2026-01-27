import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  //MONGOOSE ERRORS

  // Invalid ObjectId
  if (err.name === "CastError") {
    error = new AppError(
      "Invalid ID format",
      400,
      "INVALID_ID"
    );
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(
      `Duplicate value for field: ${field}`,
      400,
      "DUPLICATE_FIELD"
    );
  }

  //JWT ERRORS

  if (err.name === "JsonWebTokenError") {
    error = new AppError(
      "Invalid token, please login again",
      401,
      "INVALID_TOKEN"
    );
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError(
      "Token expired, please login again",
      401,
      "TOKEN_EXPIRED"
    );
  }

  //DEFAULT

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || "Internal Server Error",
      code: error.code || null,
    },
  });
};

export default errorHandler;
