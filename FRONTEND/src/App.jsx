import { BrowserRouter, Routes, Route } from "react-router-dom";

import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Profile from "./pages/UserProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import NotFound from "./pages/NotFound.jsx";
import Notifications from "./pages/Notifications";

import ProtectedRoute, {
  AdminProtectedRoute,
} from "./components/protectedRoute";

import { DarkModeProvider } from "./contexts/DarkModeContext.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx";
import { SocketProvider } from "./contexts/SocketProvider.jsx";
import { NotificationProvider } from "./contexts/NotificationProvider.jsx";

function App() {
  return (
    <DarkModeProvider>
      {/* 1. AuthProvider MUST be the top-level data provider */}
      <AuthProvider>
        {/* 2. SocketProvider is inside, so it can read 'user' from Auth */}
        <SocketProvider>
          {/* 3. NotificationProvider is inside, so it can read 'socket' */}
          <NotificationProvider>
            
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Protected user routes */}
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <Feed />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile/:username"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  <Route
                    path="/admin"
                    element={
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>

          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;