import { useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (isMounted) setUser(res.data.data.user);
      } catch (err) {
        if (err.response?.status === 401) {
          try {
            await api.post("/auth/refresh");
            const res = await api.get("/auth/me");
            if (isMounted) setUser(res.data.data.user);
          } catch {
            if (isMounted) setUser(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
