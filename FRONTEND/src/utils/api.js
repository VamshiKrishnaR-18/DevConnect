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
  getPosts: () => api.get(config.endpoints.posts.list),
  createPost: (postData) => api.post(config.endpoints.posts.create, postData),
  deletePost: (postId) => api.delete(`${config.endpoints.posts.base}/${postId}`),
  likePost: (postId) => api.post(`${config.endpoints.likes}/${postId}`),
};

export const usersAPI = {
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

// Export the configured axios instance for direct use if needed
export default api;
