import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "../../utils/cn";

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen, initDarkMode } = useUIStore();

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-200", sidebarOpen ? "ml-60" : "ml-16")}>
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
