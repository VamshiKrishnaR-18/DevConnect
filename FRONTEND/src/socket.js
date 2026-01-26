import { io } from "socket.io-client";

// ✅ FIX: Use the Environment Variable (same as API.js)
// If VITE_API_URL is set (Production), use it.
// Otherwise, fallback to localhost:3000 (Development).
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true, // Important for Cookies
  transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
});