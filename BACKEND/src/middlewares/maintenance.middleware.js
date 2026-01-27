import { SystemSetting } from "../models/SystemSetting.model.js";
import AppError from "../utils/AppError.js";

export const maintenanceMiddleware = async (req, res, next) => {
  try {
   
    if (
      req.path.startsWith("/api/auth") || 
      req.path.startsWith("/api/admin") ||
      req.path.includes("/socket.io") 
    ) {
      return next();
    }

    
    const setting = await SystemSetting.findOne({ key: "maintenance_mode" });
    const isMaintenance = setting ? setting.value : false;

    
    if (isMaintenance) {
     
      return next(new AppError("System is currently under maintenance. Please check back later.", 503));
    }

    
    next();
    
  } catch (error) {
    
    console.error("Maintenance check failed:", error);
    next(); 
  }
};