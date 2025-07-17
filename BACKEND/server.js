import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import likeRoutes from "./routes/likeRoutes.js"
import commentRoutes from "./routes/commentRoutes.js";
import {Server} from "socket.io";
import http from "http";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  }
})

io.on("connection", (socket)=>{
  console.log("Socket Connected: ", socket.id);

  socket.on("join", (userId)=>{
    socket.join(userId);
  });

  socket.on("disconnect", ()=>{
    console.log("Socket Disconnected: ", socket.id);
  })
})

app.set("io", io);



// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Connect to database
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "DevConnect API is running!",
    version: "1.0.0",
    status: "healthy",
  });
});

// Routes
try {
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");

  app.use("/api/posts", postRoutes);
  console.log("✅ Post routes loaded");

  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded");

  app.use("/api/comments", commentRoutes);
  console.log("✅ Comment routes loaded");

  app.use("/api/likes", likeRoutes);
  console.log("✅ Like routes loaded");

} catch (error) {
  console.error("❌ Error loading routes:", error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    msg: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔌 Socket.IO server is ready`);
});
