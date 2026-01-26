import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet"; // <--- 1. Import Helmet

import { generateOpenAPISpec } from "./docs/openapi.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== INIT APP ===================== */

const app = express();

/* ===================== SECURITY MIDDLEWARE ===================== */

// 2. Use Helmet FIRST (protects against XSS, sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows loading images from /uploads
}));

/* ===================== GLOBAL MIDDLEWARES ===================== */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/* ===================== IMPORT DOCS ===================== */

import "./docs/auth.docs.js";
import "./docs/posts.docs.js";

/* ===================== SWAGGER ===================== */

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(generateOpenAPISpec())
);

/* ===================== ROUTES ===================== */

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===================== ERROR HANDLER ===================== */

app.use(errorMiddleware);

export default app;