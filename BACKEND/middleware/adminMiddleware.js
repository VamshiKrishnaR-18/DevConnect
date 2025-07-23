import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if(!decoded || !decoded.id){
      return res.status(401).json({msg: "Invalid token format"});
    }

    const user = await userModel.findById(decoded.id).select("-password");

    if(!user){
      return res.status(404).json({msg: "User not found"});
    }

    if(user.role !== "admin"){
      return res.status(401).json({msg: "Access denied. Not an admin."});
    }

    req.user = user;
    next();



    
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export default adminProtect;