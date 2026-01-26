import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import compression from "compression"; // <--- Point 5: Compression
import rateLimit from "express-rate-limit"; // <--- Point 4: Rate Limiting

import { generateOpenAPISpec } from "./docs/openapi.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== INIT APP ===================== */

const app = express();

/* ===================== SECURITY & PERF MIDDLEWARE ===================== */

// Point 5: Compress responses (Speed)
app.use(compression());

// Point 3: Production Logging (Cleaner logs)
const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

// Point 4: Rate Limiting (Security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
// Apply rate limiting to all API routes
app.use("/api", limiter);

// Helmet (Security Headers)
app.use(helmet({
  crossOriginResourcePolicy: false,
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

// Keep this for local dev, but production uses Cloudinary
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===================== ERROR HANDLER ===================== */

app.use(errorMiddleware);

export default app;