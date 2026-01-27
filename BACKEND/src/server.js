import { env } from "./config/env.js";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});


app.set("io", io);


io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

 
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their notification room.`);
    }
  });


  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});


connectDB().then(() => {
  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`🔒 Security headers enabled`);
  });
});