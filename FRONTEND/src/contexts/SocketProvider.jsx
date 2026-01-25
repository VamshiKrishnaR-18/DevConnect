import React, { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import config from "../config/environment.js";
import { AuthContext } from "./AuthContext.jsx";
import { SocketContext } from "./SocketContext.js"; // <--- Import from the separate file

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Initialize Socket
    const socketInstance = io(config.SOCKET_URL, config.socketConfig);

    socketInstance.on("connect", () => {
      console.log("🔌 Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("⚠️ Socket error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  /* ===================== JOIN USER ROOM ===================== */
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("join", user._id);
    console.log("👤 Joined socket room:", user._id);
  }, [socket, user]);

  /* ===================== NOTIFICATION LISTENER ===================== */
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload) => {
      console.log("🔔 Socket Debug: Notification event received", payload);
    };

    // Listen for events
    socket.on("NOTIFICATION", handleNotification);
    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("NOTIFICATION", handleNotification);
      socket.off("notification:new", handleNotification);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};