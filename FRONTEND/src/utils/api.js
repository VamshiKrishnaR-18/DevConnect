import axios from "axios";
import config from "../config/environment.js"; // Ensure you import config if used, or keep hardcoded if preferred

const api = axios.create({
  // Use the config URL or fallback to localhost
  baseURL: config?.API_BASE_URL ? `${config.API_BASE_URL}/api` : "http://localhost:3000/api",
  withCredentials: true,
});

// Silence expected 401 for auth checks
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // FIX: Check for both /auth/me AND /auth/refresh
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