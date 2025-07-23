import { useState, useEffect, useContext } from 'react';
import { Users, FileText, Search, UserCircle, Calendar, Mail, LogOut, Settings, BarChart3, Menu, X } from 'lucide-react';
import { adminAPI } from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';

// Enhanced sidebar items with more options
const sidebarItems = [
  { title: 'Dashboard', icon: BarChart3, id: 'dashboard' },
  { title: 'Users', icon: Users, id: 'users' },
  { title: 'Posts', icon: FileText, id: 'posts' },
  { title: 'Settings', icon: Settings, id: 'settings' },
];

// Custom Sidebar Component that matches app design
function AdminSidebar({ activeSection, setActiveSection, user, onLogout, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Panel</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">DevConnect Dashboard</p>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <UserCircle size={24} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white truncate">{user?.username || 'Admin'}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Administrator</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                    ${activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-[1.02]'
                    }
                  `}
                >
                  <item.icon size={20} className={`${activeSection === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Dashboard Overview Section
function DashboardSection() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeUsers: 0,
    publishedPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch dashboard stats and recent activity
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await adminAPI.getDashboardStats();
        setStats(statsResponse.data.stats);

        // Fetch recent activity
        const activityResponse = await adminAPI.getRecentActivity();
        setRecentActivity(activityResponse.data.activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default values on error
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          activeUsers: 0,
          publishedPosts: 0
        });
        setRecentActivity([]);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUsers}</p>
            </div>
            <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalPosts}</p>
            </div>
            <div className="h-14 w-14 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <FileText className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeUsers}</p>
            </div>
            <div className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
              <UserCircle className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published Posts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.publishedPosts}</p>
            </div>
            <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${
                    activity.type === 'user_registered' ? 'bg-green-500' :
                    activity.type === 'post_created' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{activity.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-start space-x-3 px-4 py-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Users className="h-5 w-5" />
              <span className="font-medium">Add New User</span>
            </button>
            <button className="w-full flex items-center justify-start space-x-3 px-4 py-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all duration-200 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Create New Post</span>
            </button>
            <button className="w-full flex items-center justify-start space-x-3 px-4 py-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-200 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Settings className="h-5 w-5" />
              <span className="font-medium">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Users Section with real API integration
function UsersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor user accounts</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Users ({filteredUsers.length})</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25">
              <Users className="h-4 w-4" />
              <span className="font-medium">Add User</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id || user._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilepic || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`} />
                          <AvatarFallback>
                            <UserCircle size={20} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.username || user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Mail size={12} />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Posts Section with real API integration
function PostsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredPosts = posts.filter(post =>
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getPosts();
      console.log('Posts API response:', response.data); // Debug log

      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
        console.log('Posts set:', response.data.posts.length, 'posts'); // Debug log
      } else {
        console.log('No posts in response, using fallback data');
        // Fallback to mock data for demo
        setPosts([
          { _id: 1, content: 'Getting Started with React - This is a sample post about React development and best practices for building modern web applications.', user: { username: 'John Doe', profilepic: null }, category: 'Technology', status: 'Published', createdAt: '2024-03-15', views: 1250, likes: 45 },
          { _id: 2, content: 'Design Systems Best Practices - Learn how to create and maintain effective design systems for your organization.', user: { username: 'Jane Smith', profilepic: null }, category: 'Design', status: 'Draft', createdAt: '2024-03-14', views: 0, likes: 0 },
          { _id: 3, content: 'The Future of Web Development - Exploring upcoming trends and technologies that will shape web development.', user: { username: 'Mike Johnson', profilepic: null }, category: 'Technology', status: 'Published', createdAt: '2024-03-12', views: 3200, likes: 128 },
          { _id: 4, content: 'User Experience Principles - Essential UX principles every designer should know and apply.', user: { username: 'Sarah Wilson', profilepic: null }, category: 'Design', status: 'Published', createdAt: '2024-03-10', views: 2100, likes: 89 },
          { _id: 5, content: 'Building Scalable Applications - Strategies for creating applications that can grow with your business.', user: { username: 'Alex Brown', profilepic: null }, category: 'Technology', status: 'Published', createdAt: '2024-03-08', views: 1850, likes: 67 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(`Failed to fetch posts: ${error.message}`);
      // Fallback to mock data for demo
      setPosts([
        { _id: 1, content: 'Getting Started with React - This is a sample post about React development and best practices for building modern web applications.', user: { username: 'John Doe', profilepic: null }, category: 'Technology', status: 'Published', createdAt: '2024-03-15', views: 1250, likes: 45 },
        { _id: 2, content: 'Design Systems Best Practices - Learn how to create and maintain effective design systems for your organization.', user: { username: 'Jane Smith', profilepic: null }, category: 'Design', status: 'Draft', createdAt: '2024-03-14', views: 0, likes: 0 },
        { _id: 3, content: 'The Future of Web Development - Exploring upcoming trends and technologies that will shape web development.', user: { username: 'Mike Johnson', profilepic: null }, category: 'Technology', status: 'Published', createdAt: '2024-03-12', views: 3200, likes: 128 },
        { _id: 4, content: 'User Experience Principles - Essential UX principles every designer should know and apply.', user: { username: 'Sarah Wilson', profilepic: null }, category: 'Design', status: 'Published', createdAt: '2024-03-10', views: 2100, likes: 89 },
        { _id: 5, content: 'Building Scalable Applications - Strategies for creating applications that can grow with your business.', user: { username: 'Alex Brown', profilepic: null }, category: 'Technology', status: 'Published', createdAt: '2024-03-08', views: 1850, likes: 67 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await adminAPI.deletePost(postId);
      // Refresh the posts list
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Posts Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor content posts</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Posts ({filteredPosts.length})</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-green-500/25">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Create Post</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        {posts.length === 0 ? 'No posts found' : 'No posts match your search'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                  <TableRow key={post.id || post._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {post.title || post.content?.substring(0, 50) + (post.content?.length > 50 ? '...' : '')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {post.description || post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : '') || 'No description available'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.user?.profilepic || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`} />
                          <AvatarFallback>
                            <UserCircle size={16} />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.author || post.user?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {post.category || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (post.status || 'Published').toLowerCase() === 'published'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                      }`}>
                        {post.status || 'Published'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>{formatDate(post.createdAt || post.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(post.views || 0).toLocaleString()} views
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(post.likes?.length || post.likes || 0)} likes
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id || post.id)}
                          className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings Section
function SettingsSection() {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (settingsType) => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      setMessage(`${settingsType} updated successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system settings and configurations</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('successfully')
            ? 'bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Description
                </label>
                <input
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
              <button
                onClick={() => handleSaveSettings('General settings')}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
              <button
                onClick={() => handleSaveSettings('Security settings')}
                disabled={saving}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-500/25 font-medium"
              >
                {saving ? 'Saving...' : 'Update Security'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard Overview';
      case 'users': return 'Users Management';
      case 'posts': return 'Posts Management';
      case 'settings': return 'Settings';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          onLogout={handleLogout}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 mr-4 transition-colors"
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {getSectionTitle()}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                    <Calendar size={14} className="mr-2" />
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200">
                  <Settings size={16} />
                  <span className="font-medium">Quick Settings</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {activeSection === 'dashboard' && <DashboardSection />}
              {activeSection === 'users' && <UsersSection />}
              {activeSection === 'posts' && <PostsSection />}
              {activeSection === 'settings' && <SettingsSection />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}