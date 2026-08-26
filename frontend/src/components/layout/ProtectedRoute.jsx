import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";

/**
 * Route protector wrapper ensuring user authentication.
 */
export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    // Preserve intended destination path in router state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
