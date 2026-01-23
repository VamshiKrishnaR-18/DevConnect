import { z } from "zod";
import { registry } from "../docs/openapi.js";

/* ===================== REGISTER ===================== */

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

// 🔥 OpenAPI schema (derived from body)
registry.register(
  "RegisterRequest",
  registerSchema.shape.body
);

/* ===================== LOGIN ===================== */

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

registry.register(
  "LoginRequest",
  loginSchema.shape.body
);
