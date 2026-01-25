import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import config from "../config/environment.js";
import { SocketContext } from "./SocketContextStore";
import { AuthContext } from "./AuthContext.jsx";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
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
  }, [socket, user?._id]);

  /* ===================== NOTIFICATION LISTENER ===================== */
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload) => {
      console.log("🔔 Notification received:", payload);
      // frontend will fetch notifications from API
    };

    socket.on("NOTIFICATION", handleNotification);

    return () => {
      socket.off("NOTIFICATION", handleNotification);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
