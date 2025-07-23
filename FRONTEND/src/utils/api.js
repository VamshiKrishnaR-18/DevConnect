import axios from 'axios';
import config, { getApiUrl } from '../config/environment.js';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: config.API_BASE_URL,
  ...config.axiosConfig,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post(config.endpoints.auth.login, credentials),
  register: (userData) => api.post(config.endpoints.auth.register, userData),
  logout: () => api.post(config.endpoints.auth.logout),
};

export const postsAPI = {
  baseURL: config.API_BASE_URL,
  
  getPosts: () => api.get(config.endpoints.posts.list),
  
  createPost: (postData) => api.post(config.endpoints.posts.create, postData),
  
  createPostWithMedia: (formData) => {
    return api.post('/api/posts/with-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deletePost: (postId) => api.delete(`${config.endpoints.posts.base}/${postId}`),
};

export const usersAPI = {

  getUsers: () => api.get(config.endpoints.users.base),
  
  updateProfilePic: (formData) => api.put(config.endpoints.users.profilePic, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getProfile: (username) => api.get(`${config.endpoints.users.base}/${username}`),
};

export const commentsAPI = {
  addComment: (postId, commentData) => api.post(`${config.endpoints.comments}/${postId}`, commentData),
  getComments: (postId) => api.get(`${config.endpoints.comments}/${postId}`),
};

export const adminAPI = {
  login: (credentials) => api.post(config.endpoints.auth.adminLogin, credentials),

  // Dashboard endpoints
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/admin/dashboard/activity'),

  // User management endpoints
  getUsers: () => api.get('/admin/users'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Post management endpoints
  getPosts: (page = 1, limit = 10) => api.get(`/admin/posts?page=${page}&limit=${limit}`),
  deletePost: (postId) => api.delete(`/admin/posts/${postId}`),

  // Settings endpoints
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
};

// Export the configured axios instance for direct use if needed
export default api;
