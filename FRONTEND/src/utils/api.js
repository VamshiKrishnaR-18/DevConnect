import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Silence expected 401 for auth check
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthMe =
      error.config?.url?.includes("/api/auth/me") &&
      error.response?.status === 401;

    if (isAuthMe) {
      return Promise.reject(error); // silent
    }

    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
