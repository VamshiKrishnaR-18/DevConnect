import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import errorHandler from "./middleware/errorMiddleware.js";

import swaggerUi from "swagger-ui-express";
import { generateOpenAPISpec } from "./docs/openapi.js";
import "./docs/routes/auth.docs.js";
import "./docs/routes/posts.docs.js";
import "./docs/routes/comments.docs.js";



dotenv.config();

/* ================== APP & SERVER ================== */

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

/* ================== DATABASE ================== */

connectDB();

/* ================== SOCKET.IO ================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "https://dev-connect-beryl.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
});

app.set("io", io);

/* ================== GLOBAL MIDDLEWARE ================== */

app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));

/* ================== HEALTH CHECK ================== */

app.get("/", (req, res) => {
  res.json({
    message: "DevConnect API is running",
    version: "1.0.0",
  });
});

/* ================== SWAGGER ================== */

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(generateOpenAPISpec())
);

/* ================== ROUTES ================== */

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/admin", adminRoutes);

/* ================== 404 ================== */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ================== ERROR HANDLER ================== */

app.use(errorHandler);

/* ================== SERVER START ================== */

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
