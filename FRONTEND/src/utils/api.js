import axios from "axios";
import config from "../config/environment.js";

/**
 * Axios instance
 * - Uses HttpOnly cookies
 * - Base URL points to /api (VERY IMPORTANT)
 */
const api = axios.create({
  baseURL: `${config.API_BASE_URL}/api`, // ✅ FIXED
  withCredentials: true,                // ✅ REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Global response interceptor
 * Handles expired / invalid sessions
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore logout failure
      }
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/* ===================== AUTH ===================== */

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

/* ===================== ADMIN ===================== */

export const adminAPI = {
  login: (data) => api.post("/auth/admin/login", data),

  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard/stats"),
  getRecentActivity: () => api.get("/admin/dashboard/activity"),

  // Users
  getUsers: () => api.get("/admin/users"),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Posts
  getPosts: (page = 1, limit = 10) =>
    api.get(`/admin/posts?page=${page}&limit=${limit}`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),

  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};

/* ===================== USERS ===================== */

export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),

  updateProfilePic: (formData) =>
    api.put("/users/profile-pic", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

/* ===================== POSTS ===================== */

export const postsAPI = {
  getPosts: () => api.get("/posts"),

  createPost: (data) => api.post("/posts", data),

  createPostWithMedia: (formData) =>
    api.post("/posts/with-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deletePost: (id) => api.delete(`/posts/${id}`),
};

/* ===================== COMMENTS ===================== */

export const commentsAPI = {
  addComment: (postId, data) =>
    api.post(`/comments/${postId}`, data),

  getComments: (postId) =>
    api.get(`/comments/${postId}`),
};

/* ===================== LIKES ===================== */

export const likesAPI = {
  toggleLike: (postId) =>
    api.post(`/likes/${postId}`),
};

export default api;
