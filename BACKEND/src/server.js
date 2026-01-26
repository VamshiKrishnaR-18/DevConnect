import { env } from "./config/env.js"; // <--- Validated variables
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

/* ===================== SETUP SERVER ===================== */
const server = http.createServer(app);

/* ===================== SETUP SOCKET.IO ===================== */
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

// Make 'io' accessible in Controllers via req.app.get("io")
app.set("io", io);

// Handle Real-Time Connections (Joining Rooms)
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // 1. Join User Room (For private notifications)
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their notification room.`);
    }
  });

  // 2. Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

/* ===================== START SERVER ===================== */
// Connect to DB, then start listening
connectDB().then(() => {
  server.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`🔒 Security headers enabled`);
  });
});