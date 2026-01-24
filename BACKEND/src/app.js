import cookieParser from "cookie-parser";

import express from "express";
import cors from "cors";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";
import { generateOpenAPISpec } from "./docs/openapi.js";

/* ===================== INIT APP ===================== */

const app = express();

/* ===================== GLOBAL MIDDLEWARES ===================== */

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,               // allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/* ===================== IMPORT DOCS ===================== */
import "./modules/auth/auth.docs.js";
import "./modules/posts/posts.docs.js";
import "./modules/comments/comments.docs.js";

/* ===================== SWAGGER ===================== */

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(generateOpenAPISpec())
);

/* ===================== ROUTES ===================== */

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);


/* ===================== ERROR HANDLER ===================== */

import errorMiddleware from "./middlewares/error.middleware.js";
app.use(errorMiddleware);

export default app;
