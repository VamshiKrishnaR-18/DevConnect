const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
  NODE_ENV: import.meta.env.MODE,

  endpoints: {
    auth: {
      login: "/api/auth/login",
      register: "/api/auth/register",
      logout: "/api/auth/logout",
      adminLogin: "/api/auth/admin/login",
      me: "/api/auth/me",
    },
    posts: "/api/posts",
    users: "/api/users",
    comments: "/api/comments",
    likes: "/api/likes",
  },

  axiosConfig: {
    withCredentials: true,
    timeout: 30000,
  },

  socketConfig: {
    withCredentials: true,
    transports: ["websocket"],
  },
};

export default config;
