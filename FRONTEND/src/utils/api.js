import axios from "axios";

// 1. DYNAMIC BASE URL (The Fix)
// - In PROD (Vercel): Uses 'VITE_API_URL' (e.g., https://devconnect-api.onrender.com/api)
// - In DEV (Local): Falls back to "/api", which uses the Vite Proxy to talk to localhost:3000
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. YOUR INTERCEPTORS (Kept exactly the same)
// Silence expected 401 for auth checks
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for both /auth/me AND /auth/refresh
    const isAuthCheck =
      (error.config?.url?.includes("/auth/me") || 
       error.config?.url?.includes("/auth/refresh")) &&
      error.response?.status === 401;

    if (isAuthCheck) {
      // Not logged in — normal case, don't log as error
      return Promise.reject(error);
    }

    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;