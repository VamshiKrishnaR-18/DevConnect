import Notification from "../models/Notification.model.js";

/* ===================== CREATE ===================== */
export const createNotification = async ({
  recipient,
  sender,
  type,
  post,
  message,
}) => {
  return Notification.create({
    recipient,
    sender,
    type,
    post,
    message,
  });
};

/* ===================== FETCH ===================== */
export const getUserNotifications = async (userId) => {
  return Notification.find({ recipient: userId })
    .populate("sender", "username profilepic")
    .populate("post", "content")
    .sort({ createdAt: -1 });
};

/* ===================== MARK READ ===================== */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};
