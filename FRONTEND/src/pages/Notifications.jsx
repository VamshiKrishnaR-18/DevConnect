import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { getProfileImageSrc } from "../utils/imageUtils";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
      
      // Mark as read immediately when opening the page
      await api.put("/notifications/read");
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "LIKE": return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case "COMMENT": return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />;
      case "FOLLOW": return <UserPlus className="w-5 h-5 text-green-500 fill-current" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          
          <div className="p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold dark:text-white">Notifications</h1>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notifications yet.</div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-4 flex items-center gap-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  {/* Icon Badge */}
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                    {getIcon(notif.type)}
                  </div>

                  {/* Avatar */}
                  <Link to={`/profile/${notif.sender.username}`}>
                    <img 
                      src={getProfileImageSrc(notif.sender.profilepic || notif.sender.profilePic)} 
                      alt="User" 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-bold">{notif.sender.username}</span>{" "}
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;