import express from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";

import protect from "../middlewares/auth.middleware.js"; 

const router = express.Router();

router.use(protect); // All routes require login

router.get("/", getNotifications);
router.put("/read", markAsRead);

export default router;