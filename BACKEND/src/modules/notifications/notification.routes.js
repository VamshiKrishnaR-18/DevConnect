import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  markNotificationsRead,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read", authMiddleware, markNotificationsRead);

export default router;
