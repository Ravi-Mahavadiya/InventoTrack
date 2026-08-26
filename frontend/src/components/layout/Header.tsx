import { Bell, Menu, Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/stock": "Stock Management",
  "/audit-logs": "Audit Logs",
};

export default function Header() {
  const { user } = useAuthStore();
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUIStore();
  const location = useLocation();

  const title = Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? "Inventra";

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors lg:hidden">
          <Menu size={18} />
        </button>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Toggle theme mode"
        >
          {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center ml-1">
          <span className="text-white text-xs font-semibold">{user?.name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
