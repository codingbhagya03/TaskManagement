import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("authToken"); // Check JWT Token
  
  // Verify authentication on mount if there's a token but not authenticated in context
  useEffect(() => {
    if (token && !isAuthenticated && !loading) {
      checkAuth();
    }
  }, [token, isAuthenticated, loading, checkAuth]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated and no token exists, redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;