import Notification from "../models/Notification.model.js";
import { emitSocketEvent } from "../utils/emitSocketEvent.js";

/* ===================== CREATE NOTIFICATION ===================== */
export const createNotification = async ({ recipient, sender, type, message, link, io }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
      read: false
    });

    // FIX: Send Real-time Update
    if (io) {
      // The event name must match what NotificationProvider.jsx expects ("notification:new")
      emitSocketEvent(io, "notification:new", notification);
    }
    
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

/* ===================== GET USER NOTIFICATIONS ===================== */
export const getUserNotificationsService = async (userId) => {
  return await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 }) // Newest first
    .populate("sender", "username profilepic") // Show who did it
    .limit(50);
};

/* ===================== MARK AS READ ===================== */
export const markNotificationsReadService = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );
  return true;
};