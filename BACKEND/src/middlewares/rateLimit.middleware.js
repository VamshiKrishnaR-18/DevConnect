import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const authRateLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many attempts. Please try again later.",
      },
    });
