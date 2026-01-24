import Notification from "../models/Notification.model.js";

export const createNotification = async ({
  recipient,
  sender,
  type,
  post,
  message,
}) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
    message,
  });

  return notification;
};

export const getUserNotifications = async (userId) => {
  return Notification.find({ recipient: userId })
    .populate("sender", "username profilepic")
    .populate("post", "content")
    .sort({ createdAt: -1 })
    .limit(50);
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};
