import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Tag, BarChart3, LogOut, ChevronLeft, ChevronRight, Boxes, Settings } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../utils/cn";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/stock", icon: BarChart3, label: "Stock Management" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={cn(
      "fixed top-0 left-0 h-full bg-[#0F172A] flex flex-col z-30 transition-all duration-200",
      sidebarOpen ? "w-60" : "w-16"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/5", !sidebarOpen && "justify-center")}>
        <div className="shrink-0 w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Boxes size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <p className="text-white font-semibold text-sm leading-none">Inventra</p>
            <p className="text-slate-400 text-xs mt-0.5">Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive
                ? "bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-400 pl-2.5"
                : "text-slate-400 hover:text-white hover:bg-white/5",
              !sidebarOpen && "justify-center px-2"
            )}
          >
            <Icon size={18} className="shrink-0" />
            {sidebarOpen && label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center p-2 text-slate-500 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-slate-700 transition-colors z-10"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
