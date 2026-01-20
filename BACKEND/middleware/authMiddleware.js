import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    // ✅ Get token from HttpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        msg: "Not authenticated",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        msg: "Invalid token",
      });
    }

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        msg: "User not found",
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Session expired" });
    }

    return res.status(401).json({
      msg: "Invalid or expired token",
    });
  }
};

export default protect;
