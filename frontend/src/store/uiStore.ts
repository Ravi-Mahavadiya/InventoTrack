import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  toggleDarkMode: () => void;
  initDarkMode: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  isDarkMode: localStorage.getItem("theme") === "dark",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleDarkMode: () => {
    const nextDark = !get().isDarkMode;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    set({ isDarkMode: nextDark });
  },
  initDarkMode: () => {
    const isDark = get().isDarkMode;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
}));
