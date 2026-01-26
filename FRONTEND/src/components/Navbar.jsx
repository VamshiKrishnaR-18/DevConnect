import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext"; 
import { useDarkMode } from "../contexts/DarkModeContext";
import { getProfileImageSrc } from "../utils/imageUtils";
import api from "../utils/api"; // <--- Import API
import "./Navbar.css";
import { Bell, Menu, X, Sun, Moon, LogOut, Search } from "lucide-react"; // <--- Import Search Icon

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, markAllAsRead } = useNotification(); 
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
      if (showSearch && searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, showSearch]);

  // --- SEARCH HANDLER (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const res = await api.get(`/users/search?query=${searchQuery}`);
          setSearchResults(res.data.data);
          setShowSearch(true);
        } catch (error) {
          console.error("Search failed", error);
        }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    }, 300); // Wait 300ms after typing stops

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  /* ===================== HANDLERS ===================== */
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled
          ? "shadow-md bg-white/90 dark:bg-gray-900/95 border-gray-200 dark:border-gray-800"
          : "bg-white dark:bg-gray-900 border-transparent dark:border-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ===================== LOGO ===================== */}
        <Link
          to={user ? (user.role === "admin" ? "/admin" : "/feed") : "/"}
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent shrink-0 hover:opacity-80 transition-opacity"
        >
          DevConnect
        </Link>

        {/* ===================== SEARCH BAR (Desktop) ===================== */}
        {user && (
          <div className="hidden md:block flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearch(true)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 border focus:border-blue-500 rounded-full text-sm transition-all outline-none"
              />
            </div>

            {/* Dropdown Results */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleUserClick(u.username)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <img
                      src={getProfileImageSrc(u.profilepic)}
                      alt={u.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{u.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== DESKTOP RIGHT ===================== */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          {user && user.role !== "admin" && (
            <Link to="/feed" className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Feed
            </Link>
          )}

          {/* Notifications */}
          {user && (
            <Link
              to="/notifications" 
              onClick={markAllAsRead}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Dark Mode */}
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* USER MENU */}
          {user ? (
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={getProfileImageSrc(user.profilepic)}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-all"
                  onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    to={`/profile/${user.username}`}
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">Register</Link>
            </div>
          )}
        </div>

        {/* ===================== MOBILE HAMBURGER ===================== */}
        <button
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ===================== MOBILE MENU ===================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-5">
          {user ? (
            <>
              {/* Mobile Search Input */}
              <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
                   onKeyDown={(e) => {
                     if(e.key === 'Enter') {
                       // Simple mobile implementation: navigate to profile if typed exactly, 
                       // or you could build a dedicated search page.
                       // For now, let's just close menu
                       setIsMobileMenuOpen(false);
                     }
                   }}
                 />
              </div>

              <Link 
                to={`/profile/${user.username}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <img
                  src={getProfileImageSrc(user.profilepic)}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => (e.target.src = "/defaultAvatar.svg")}
                />
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </Link>

              {user.role !== "admin" && (
                <Link to="/feed" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600">
                  Feed
                </Link>
              )}
              
               <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center py-2.5 font-medium text-gray-700 dark:text-gray-200">
                <span className="flex items-center gap-2"><Bell size={18}/> Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <button onClick={toggleDarkMode} className="w-full text-left py-2.5 font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                {isDarkMode ? <><Sun size={18}/> Light Mode</> : <><Moon size={18}/> Dark Mode</>}
              </button>

              <button onClick={handleLogout} className="w-full text-left py-2.5 font-medium text-red-500 flex items-center gap-2">
                <LogOut size={18}/> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-2.5 font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg">Login</Link>
              <Link to="/register" className="w-full text-center py-2.5 font-medium bg-blue-600 text-white rounded-lg shadow-md">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}