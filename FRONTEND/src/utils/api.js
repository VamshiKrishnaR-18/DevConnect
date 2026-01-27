import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate instance for refreshing (No interceptors attached)
const refreshApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // IF 401 (Unauthorized) AND we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried

      try {
        // 1. Try to refresh the token
        await refreshApi.post("/auth/refresh");

        // 2. Retry the original request (e.g., /auth/me or /cover-pic)
        return api(originalRequest);
      } catch (refreshError) {
        // 3. If Refresh Fails: DO NOT RELOAD PAGE.
        // Just reject the promise. The UI will handle "Not Logged In".
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;