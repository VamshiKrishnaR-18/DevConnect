import { useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user (ADMIN) using HttpOnly cookie
  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Called after normal user login
  const login = (userData) => {
    setUser(userData);
  };

  // Called after admin login
  const adminLogin = (adminData) => {
    setUser(adminData);
  };

  // Logout (backend should clear cookie)
  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === "admin";

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        logout,
        isAdmin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
