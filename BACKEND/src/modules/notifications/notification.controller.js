import catchAsync from "../../utils/catchAsync.js";
import {
  getUserNotifications,
  markAllAsRead,
} from "../../services/notification.service.js";

/* ===================== GET NOTIFICATIONS ===================== */

export const getNotifications = catchAsync(async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);

  res.status(200).json({
    success: true,
    data: { notifications },
  });
});

/* ===================== MARK AS READ ===================== */

export const markNotificationsRead = catchAsync(async (req, res) => {
  await markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});
