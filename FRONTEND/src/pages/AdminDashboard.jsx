import { useState, useEffect, useContext } from "react";
import {
  Users,
  FileText,
  Search,
  UserCircle,
  Calendar,
  Mail,
  LogOut,
  Settings,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

import api from "../utils/api";
import { AuthContext } from "../contexts/AuthContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";

/* ===============================
   SIDEBAR
================================ */
const sidebarItems = [
  { title: "Dashboard", icon: BarChart3, id: "dashboard" },
  { title: "Users", icon: Users, id: "users" },
  { title: "Posts", icon: FileText, id: "posts" },
  { title: "Settings", icon: Settings, id: "settings" },
];

function AdminSidebar({
  activeSection,
  setActiveSection,
  user,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
}) {
  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r
        transform transition-transform lg:translate-x-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden"
              >
                <X />
              </button>
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.profilepic} />
                <AvatarFallback>
                  <UserCircle />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user?.username}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded
                ${
                  activeSection === item.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon size={18} />
                <span>{item.title}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===============================
   DASHBOARD
================================ */
function DashboardSection() {
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const statsRes = await api.get("/admin/dashboard/stats");
        const actRes = await api.get("/admin/dashboard/activity");
        setStats(statsRes.data.stats);
        setActivity(actRes.data.activities);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <pre className="text-sm bg-gray-100 p-4 rounded">
        {JSON.stringify(stats, null, 2)}
      </pre>

      <h3 className="mt-6 font-semibold">Recent Activity</h3>
      <ul className="mt-2 text-sm text-gray-600">
        {activity.map((a, i) => (
          <li key={i}>• {a.message}</li>
        ))}
      </ul>
    </div>
  );
}

/* ===============================
   USERS
================================ */
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/users").then((res) => {
      setUsers(res.data.users || []);
    });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <input
        placeholder="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 border p-2 rounded"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.username}</TableCell>
              <TableCell>
                <Badge>{u.role}</Badge>
              </TableCell>
              <TableCell>
                {new Date(u.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

/* ===============================
   POSTS
================================ */
function PostsSection() {
  const [posts, setPosts] = useState([]);

  const load = async () => {
    const res = await api.get("/admin/posts");
    setPosts(res.data.posts || []);
  };

  useEffect(() => {
    load();
  }, []);

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/admin/posts/${id}`);
    load();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Author</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((p) => (
          <TableRow key={p._id}>
            <TableCell>{p.content.slice(0, 50)}...</TableCell>
            <TableCell>{p.user?.username}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deletePost(p._id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ===============================
   SETTINGS
================================ */
function SettingsSection() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get("/admin/settings").then((res) => {
      setSettings(res.data.settings);
    });
  }, []);

  const save = async () => {
    await api.put("/admin/settings", settings);
    alert("Settings updated");
  };

  return (
    <div>
      <textarea
        value={JSON.stringify(settings, null, 2)}
        onChange={(e) => setSettings(JSON.parse(e.target.value))}
        className="w-full h-48 border p-2 rounded"
      />
      <Button className="mt-4" onClick={save}>
        Save
      </Button>
    </div>
  );
}

/* ===============================
   MAIN
================================ */
export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [mobile, setMobile] = useState(false);
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex">
      <AdminSidebar
        activeSection={active}
        setActiveSection={setActive}
        user={user}
        onLogout={logout}
        isMobileOpen={mobile}
        setIsMobileOpen={setMobile}
      />

      <main className="flex-1 p-6 ml-0 lg:ml-64">
        {active === "dashboard" && <DashboardSection />}
        {active === "users" && <UsersSection />}
        {active === "posts" && <PostsSection />}
        {active === "settings" && <SettingsSection />}
      </main>
    </div>
  );
}
