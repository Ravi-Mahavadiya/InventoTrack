import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";

/**
 * Public route wrapper to redirect authenticated users away from login/register screens.
 */
export default function PublicRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (token) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children;
}
