import React, { useState, useEffect, useContext, useRef } from "react";
import { io } from "socket.io-client";
import config from "../config/environment.js";
import { AuthContext } from "./AuthContext.jsx";
import { SocketContext } from "./SocketContext.js";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);
  
  // Use a ref to hold the socket instance so it survives Strict Mode remounts
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Create socket only if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(config.SOCKET_URL, {
        ...config.socketConfig,
        // Optional: Manual connect prevents "auto-connect" race conditions
        autoConnect: false 
      });
      
      // Connect manually
      socketRef.current.connect();
      
      // Debug listeners
      socketRef.current.on("connect", () => {
        console.log("🔌 Socket connected:", socketRef.current.id);
      });
      
      // Save to state so children can use it
      setSocket(socketRef.current);
    }

    // 2. Cleanup: Only disconnect if the component is TRULY unmounting
    // Note: In strict mode, this still runs, but we can verify state.
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  /* ===================== JOIN USER ROOM ===================== */
  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("join", user._id);
    console.log("👤 Joined socket room:", user._id);
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};