import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = (userData, token) => {
    try {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  // Admin-specific login method
  const adminLogin = (adminData, token) => {
    try {
      // Ensure the user data includes role information
      const adminUser = {
        ...adminData,
        role: adminData.role || "admin" // Ensure role is set
      };
      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error storing admin data:", error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user && user.role === "admin";
  };

  useEffect(() => {
    if (user && !isTokenValid()) {
      logout();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      adminLogin,
      logout,
      loading,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;