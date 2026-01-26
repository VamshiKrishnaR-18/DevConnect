import { z } from "zod";
import dotenv from "dotenv";

// Load .env file (if running locally)
dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Database
  MONGO_URI: z.string().url("❌ Invalid MONGO_URI"),
  
  // Security / Secrets
  JWT_SECRET: z.string().min(1, "❌ JWT_SECRET is missing"),
  JWT_REFRESH_SECRET: z.string().min(1, "❌ JWT_REFRESH_SECRET is missing"),
  
  // Client (CORS)
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
});

// This will throw a clear error if variables are missing
export const env = envSchema.parse(process.env);