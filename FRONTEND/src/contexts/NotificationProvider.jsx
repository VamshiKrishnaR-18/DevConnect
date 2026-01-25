import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import api from "../utils/api.js";
import { useSocket } from "./SocketContext.js"; 
import { NotificationContext } from "./NotificationContext.js"; 

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. DEBUG: Check if Provider is mounting
  useEffect(() => {
    console.log("📢 NotificationProvider Mounted. Socket:", !!socket, "User:", !!user);
  }, [socket, user]);

  // 2. Fetch initial count
  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const res = await api.get("/notifications");
          const unread = res.data.data.filter((n) => !n.read).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };
      fetchUnreadCount();
    }
  }, [user]);

  // 3. Real-time Listener
  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (newNotif) => {
      console.log("🔔 REAL-TIME EVENT RECEIVED!", newNotif);
      setUnreadCount((prev) => prev + 1);
    };

    console.log("👂 Listening for 'notification:new' on socket...");
    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, user]);

  const markAllAsRead = async () => {
    setUnreadCount(0);
    try {
      await api.put("/notifications/read");
    } catch (error) {
      // 👇 FIX: We added 'error' here to satisfy ESLint
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};