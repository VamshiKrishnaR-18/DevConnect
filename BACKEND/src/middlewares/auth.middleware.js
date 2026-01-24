import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

const authMiddleware = catchAsync(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return next(
      new AppError("Access token missing", 401, "NO_ACCESS_TOKEN")
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (err) {
    return next(
      new AppError(
        "Access token invalid or expired",
        401,
        "INVALID_ACCESS_TOKEN"
      )
    );
  }

  const user = await User.findById(decoded.id).select(
    "-password -refreshToken -resetPasswordToken"
  );

  if (!user) {
    return next(
      new AppError("User no longer exists", 401, "USER_NOT_FOUND")
    );
  }

  req.user = user;
  next();
});

export default authMiddleware;
