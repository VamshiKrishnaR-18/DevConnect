import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import ProtectedRoute from "./components/protectedRoute";
import Profile from "./pages/UserProfile.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import { DarkModeProvider } from "./contexts/DarkModeContext.jsx";

function App() {
  return (
    <DarkModeProvider>
      <SocketProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
            </Routes>
          </BrowserRouter>
        </div>
      </SocketProvider>
    </DarkModeProvider>
  );
}

export default App;
