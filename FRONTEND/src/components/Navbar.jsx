import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { NotificationContext } from "../contexts/NotificationContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getProfileImageSrc } from "../utils/imageUtils";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, markAllAsRead } = useContext(NotificationContext);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  /* ===================== HANDLERS ===================== */

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all ${
        isScrolled
          ? "shadow-lg bg-white/95 dark:bg-gray-900/95"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* ===================== LOGO ===================== */}
        <Link
          to={user ? (user.role === "admin" ? "/admin" : "/feed") : "/"}
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          DevConnect
        </Link>

        {/* ===================== DESKTOP ===================== */}
        <div className="hidden md:flex items-center gap-4">
          {user && user.role !== "admin" && (
            <Link to="/feed" className="nav-link">Feed</Link>
          )}

          {/* 🔔 Notifications */}
          {user && (
            <button
              onClick={markAllAsRead}
              className="relative p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* 🌙 Dark Mode */}
          <button onClick={toggleDarkMode} className="p-2 rounded-xl">
            {isDarkMode ? "🌞" : "🌙"}
          </button>

          {/* 👤 USER MENU */}
          {user ? (
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                <img
                  src={getProfileImageSrc(user.profilepic)}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                  onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                />
                <span>{user.username}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-xl shadow">
                  <Link
                    to={`/profile/${user.username}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>

        {/* ===================== MOBILE ===================== */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* ===================== MOBILE MENU ===================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t px-4 py-3 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={getProfileImageSrc(user.profilepic)}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                />
                <span>{user.username}</span>
              </div>

              {user.role !== "admin" && (
                <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)}>
                  Feed
                </Link>
              )}

              {/* 🔔 Notifications (mobile) */}
              <button
                onClick={markAllAsRead}
                className="flex justify-between items-center"
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button onClick={toggleDarkMode}>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </button>

              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
