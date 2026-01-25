import Notification from "../models/Notification.model.js";

/* ===================== CREATE NOTIFICATION ===================== */
// This function is called internally by Post/User services
export const createNotification = async ({ recipient, sender, type, message, link }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
      read: false
    });

    // We don't await this because we don't want to block the user request
    // Just let it populate in the background if needed for sockets
    // (Real-time socket logic would go here)
    
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