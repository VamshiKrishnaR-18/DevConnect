import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Activity, 
  Settings, 
  Search, 
  AlertTriangle, 
  Shield, 
  Trash2, 
  Lock, 
  Power,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Make sure to: npm install date-fns

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  
  // Users State
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Posts State
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [postSearch, setPostSearch] = useState("");
  const [postTotalPages, setPostTotalPages] = useState(1);

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentSearch, setCommentSearch] = useState("");
  const [commentTotalPages, setCommentTotalPages] = useState(1);

  // Settings State
  const [settings, setSettings] = useState({});

  // --- 1. FETCH FUNCTIONS ---

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (error) { console.error(error); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users?page=${userPage}&limit=10&search=${userSearch}`);
      setUsers(res.data.data.users);
      setUserTotalPages(res.data.data.totalPages);
    } catch (error) { console.error(error); }
  }, [userPage, userSearch]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get(`/admin/posts?page=${postPage}&limit=10&search=${postSearch}`);
      setPosts(res.data.data.posts);
      setPostTotalPages(res.data.data.totalPages);
    } catch (error) { console.error(error); }
  }, [postPage, postSearch]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/admin/comments?page=${commentPage}&limit=10&search=${commentSearch}`);
      setComments(res.data.data.comments);
      setCommentTotalPages(res.data.data.totalPages);
    } catch (error) { console.error(error); }
  }, [commentPage, commentSearch]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get("/admin/settings");
      setSettings(res.data.data);
    } catch (error) { console.error(error); }
  }, []);

  // --- 2. EFFECTS ---

  useEffect(() => {
    if (activeTab === "overview") fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "posts") fetchPosts();
    if (activeTab === "comments") fetchComments();
    if (activeTab === "settings") fetchSettings();
  }, [activeTab, fetchStats, fetchUsers, fetchPosts, fetchComments, fetchSettings]); 

  // --- 3. ACTIONS ---

  const handleBanUser = async (userId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? "unban" : "ban"} this user?`)) {
      try { 
        await api.post(`/admin/users/${userId}/ban`); 
        fetchUsers(); 
      } catch { alert("Action failed"); }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Delete this post permanently?")) {
      try { await api.delete(`/admin/posts/${postId}`); fetchPosts(); } catch { alert("Failed to delete"); }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      try { await api.delete(`/admin/comments/${commentId}`); fetchComments(); } catch { alert("Failed to delete"); }
    }
  };

  const toggleSetting = async (key, currentValue) => {
    try {
      const newValue = !currentValue;
      await api.put("/admin/settings", { key, value: newValue });
      setSettings(prev => ({ ...prev, [key]: newValue }));
    } catch { alert("Failed to update"); }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex gap-6">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-fit sticky top-6">
        <div className="flex items-center gap-2 mb-8 px-2 text-blue-600">
          <Shield size={28} />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="space-y-2">
          <TabButton icon={<Activity />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <TabButton icon={<Users />} label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <TabButton icon={<FileText />} label="Posts" active={activeTab === "posts"} onClick={() => setActiveTab("posts")} />
          <TabButton icon={<MessageSquare />} label="Comments" active={activeTab === "comments"} onClick={() => setActiveTab("comments")} />
          <TabButton icon={<Settings />} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-500" />} />
               <StatCard title="Total Posts" value={stats.totalPosts} icon={<FileText className="text-purple-500" />} />
               <StatCard title="Active Users" value={stats.activeUsers} icon={<Activity className="text-green-500" />} />
             </div>

             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
               <h2 className="text-xl font-bold dark:text-white mb-4">Recent Activity</h2>
               <div className="space-y-4">
                 {stats.recentActivity?.map(log => (
                   <div key={log._id} className="flex justify-between items-center border-b dark:border-gray-700 pb-3 last:border-0">
                      <div>
                        <span className="font-bold text-blue-500">{log.adminId?.username || "System"}</span> 
                        <span className="text-gray-600 dark:text-gray-300 ml-2">{log.action}: {log.details}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                   </div>
                 ))}
                 {!stats.recentActivity?.length && <p className="text-gray-500">No activity logged yet.</p>}
               </div>
             </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-64"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm dark:text-gray-300">
                <thead>
                  <tr className="border-b dark:border-gray-700 text-gray-500">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 font-medium">
                        <div className="text-blue-600 dark:text-blue-400">{u.username}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.isBanned ? (
                          <span className="text-red-500 flex items-center gap-1 text-xs font-bold"><Lock size={12}/> Banned</span> 
                        ) : (
                          <span className="text-green-500 text-xs font-bold">Active</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleBanUser(u._id, u.isBanned)}
                            className={`p-2 rounded-lg transition-colors ${u.isBanned ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                            title={u.isBanned ? "Unban User" : "Ban User"}
                          >
                            <Power size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!users.length && <div className="text-center py-8 text-gray-500">No users found.</div>}
            </div>
            
            {/* Pagination */}
            <Pagination currentPage={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Post Moderation</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by user or content..." 
                  className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-64"
                  value={postSearch}
                  onChange={(e) => { setPostSearch(e.target.value); setPostPage(1); }}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm dark:text-gray-300">
                <thead>
                  <tr className="border-b dark:border-gray-700 text-gray-500">
                    <th className="pb-3">Author</th>
                    <th className="pb-3">Content</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post._id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 font-medium text-blue-500">
                        {post.user?.username || "Unknown"}
                      </td>
                      <td className="py-3 max-w-md truncate">
                        {post.content}
                        {post.image && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1 rounded">IMG</span>}
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 text-right">
                         <button 
                           onClick={() => handleDeletePost(post._id)}
                           className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                           title="Delete Post"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!posts.length && <div className="text-center py-8 text-gray-500">No posts found.</div>}
            </div>

            <Pagination currentPage={postPage} totalPages={postTotalPages} onPageChange={setPostPage} />
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === "comments" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Comment Moderation</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by user or comment..." 
                  className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-64"
                  value={commentSearch}
                  onChange={(e) => { setCommentSearch(e.target.value); setCommentPage(1); }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm dark:text-gray-300">
                <thead>
                  <tr className="border-b dark:border-gray-700 text-gray-500">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Comment</th>
                    <th className="pb-3">On Post</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map(comment => (
                    <tr key={comment._id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 font-medium text-blue-500">
                        {comment.user?.username || "Unknown"}
                      </td>
                      <td className="py-3 max-w-sm truncate text-gray-700 dark:text-gray-300">
                        "{comment.content}"
                      </td>
                      <td className="py-3 text-xs text-gray-400 max-w-xs truncate">
                         {comment.post ? (comment.post.content || "Image Post") : "Deleted Post"}
                      </td>
                      <td className="py-3 text-right">
                         <button 
                           onClick={() => handleDeleteComment(comment._id)}
                           className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                           title="Delete Comment"
                         >
                           <Trash2 size={16} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!comments.length && <div className="text-center py-8 text-gray-500">No comments found.</div>}
            </div>

            <Pagination currentPage={commentPage} totalPages={commentTotalPages} onPageChange={setCommentPage} />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-in fade-in">
             <h2 className="text-xl font-bold dark:text-white mb-6">Settings</h2>
             
             <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
               <div>
                 <h4 className="font-medium dark:text-white">Maintenance Mode</h4>
                 <p className="text-sm text-gray-500">Only admins can access the site.</p>
               </div>
               <button onClick={() => toggleSetting("maintenance_mode", settings.maintenance_mode)} className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.maintenance_mode ? 'left-7' : 'left-1'}`} />
               </button>
             </div>

             <div className="flex items-center justify-between py-4">
               <div>
                 <h4 className="font-medium dark:text-white">Allow Registrations</h4>
                 <p className="text-sm text-gray-500">New users can create accounts.</p>
               </div>
               <button onClick={() => toggleSetting("registrations_open", settings.registrations_open)} className={`w-12 h-6 rounded-full relative transition-colors ${settings.registrations_open ? 'bg-blue-600' : 'bg-gray-300'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.registrations_open ? 'left-7' : 'left-1'}`} />
               </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const TabButton = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
    }`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
    </div>
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{icon}</div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-end items-center mt-6 gap-2">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(p => Math.max(1, p - 1))}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};