import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

// Admin-specific protected route that checks for admin role
export const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Check if user exists and has admin role
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access the admin dashboard. This area is restricted to administrators only.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;