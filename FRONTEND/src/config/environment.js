// Environment detection
const isProduction = import.meta.env.PROD ||
                    import.meta.env.VITE_NODE_ENV === 'production' ||
                    window.location.hostname !== 'localhost';

const isDevelopment = !isProduction;

// Debug logging (only in development)
if (isDevelopment) {
  console.log('🔧 DevConnect Environment Debug:', {
    'import.meta.env.PROD': import.meta.env.PROD,
    'VITE_NODE_ENV': import.meta.env.VITE_NODE_ENV,
    'hostname': window.location.hostname,
    'isProduction': isProduction,
    'API_BASE_URL': isProduction
      ? (import.meta.env.VITE_API_BASE_URL || 'https://devconnect-f4au.onrender.com')
      : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000')
  });
}

// Environment configuration
const config = {
  // API Configuration - automatically switches based on environment
  API_BASE_URL: isProduction
    ? (import.meta.env.VITE_API_BASE_URL || 'https://devconnect-f4au.onrender.com')
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'),

  SOCKET_URL: isProduction
    ? (import.meta.env.VITE_SOCKET_URL || 'https://devconnect-f4au.onrender.com')
    : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'),

  NODE_ENV: isProduction ? 'production' : 'development',

  // Helper methods
  isDevelopment: () => isDevelopment,
  isProduction: () => isProduction,
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
    },
    posts: {
      base: '/api/posts',
      create: '/api/posts',
      list: '/api/posts',
    },
    users: {
      base: '/api/users',
      profilePic: '/api/users/profilepic',
    },
    comments: '/api/comments',
    likes: '/api/likes',
  },
  
  // Socket configuration
  socketConfig: {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
  },
  
  // Axios default configuration
  axiosConfig: {
    withCredentials: true,
    timeout: 30000,
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to get socket URL
export const getSocketUrl = () => {
  return config.SOCKET_URL;
};

export default config;
