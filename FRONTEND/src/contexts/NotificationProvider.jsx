import { useContext, useEffect, useState } from "react";
import { NotificationContext } from "./NotificationContext";
import { SocketContext } from "./SocketContextStore";
import { AuthContext } from "./AuthContext";
import api from "../utils/api.js";

export const NotificationProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on login
  useEffect(() => {
    if (!user) return;

    api.get("/notifications").then((res) => {
      const notes = res.data.data.notifications;
      setNotifications(notes);
      setUnreadCount(notes.filter((n) => !n.isRead).length);
    });
  }, [user]);

  // Listen to socket notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (payload) => {
      // optional safety check
      if (payload.data?.recipient !== user._id) return;

      setNotifications((prev) => [payload.data, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, user]);

  const markAllAsRead = async () => {
    await api.put("/notifications/read");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
