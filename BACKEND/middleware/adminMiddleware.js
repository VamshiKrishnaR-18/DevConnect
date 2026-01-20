import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const adminProtect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token)
    return res.status(401).json({ msg: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.role !== "admin")
      return res.status(403).json({ msg: "Admin only" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export default adminProtect;
