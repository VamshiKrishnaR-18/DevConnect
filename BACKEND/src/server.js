import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

/* ===================== DB ===================== */
connectDB();

/* ===================== HTTP SERVER ===================== */
const server = http.createServer(app);

/* ===================== SOCKET.IO ===================== */
const io = new Server(server, {
  cors: {
    // CHANGE: Allow env variable or array of common ports
    origin: process.env.CLIENT_URL || ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

// Make io available everywhere
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* ===================== START SERVER ===================== */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});