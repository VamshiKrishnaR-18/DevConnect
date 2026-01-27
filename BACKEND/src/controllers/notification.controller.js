import catchAsync from "../utils/catchAsync.js";
import { 
  getUserNotificationsService, 
  markNotificationsReadService 
} from "../services/notification.service.js";

//GET NOTIFICATIONS
export const getNotifications = catchAsync(async (req, res) => {
  const notifications = await getUserNotificationsService(req.user._id);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

//MARK AS READ
export const markAsRead = catchAsync(async (req, res) => {
  await markNotificationsReadService(req.user._id);

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
  });
});