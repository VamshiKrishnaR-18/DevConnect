// Environment detection - be very explicit about development
const isProduction = import.meta.env.VITE_NODE_ENV === 'production';
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' ||
                     import.meta.env.DEV ||
                     !import.meta.env.PROD;

// Debug logging (always show in console for debugging)
console.log('🔧 DevConnect Environment Debug:', {
  'import.meta.env.PROD': import.meta.env.PROD,
  'import.meta.env.DEV': import.meta.env.DEV,
  'VITE_NODE_ENV': import.meta.env.VITE_NODE_ENV,
  'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
  'VITE_SOCKET_URL': import.meta.env.VITE_SOCKET_URL,
  'hostname': window.location.hostname,
  'isProduction': isProduction,
  'isDevelopment': isDevelopment
});

// Environment configuration
const config = {
  // API Configuration - force localhost for development
  API_BASE_URL: isDevelopment
    ? 'http://localhost:3000'
    : (import.meta.env.VITE_API_BASE_URL || 'https://devconnect-f4au.onrender.com'),

  SOCKET_URL: isDevelopment
    ? 'http://localhost:3000'
    : (import.meta.env.VITE_SOCKET_URL || 'https://devconnect-f4au.onrender.com'),

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
      adminLogin: '/api/auth/admin/login',
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

// Log the final configuration being used
console.log('🚀 DevConnect Final Config:', {
  'API_BASE_URL': config.API_BASE_URL,
  'SOCKET_URL': config.SOCKET_URL,
  'NODE_ENV': config.NODE_ENV
});

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to get socket URL
export const getSocketUrl = () => {
  return config.SOCKET_URL;
};

export default config;
