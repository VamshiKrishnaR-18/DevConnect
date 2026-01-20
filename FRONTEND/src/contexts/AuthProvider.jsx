import { useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => setUser(userData);
  const adminLogin = (userData) => setUser(userData);

  const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } catch (err) {
    console.error("Logout failed", err);
  }
  setUser(null);
};


  const isAdmin = () => user?.role === "admin";

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, adminLogin, logout, isAdmin }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
