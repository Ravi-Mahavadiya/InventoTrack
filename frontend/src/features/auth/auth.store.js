import { create } from "zustand";

/**
 * Zustand store for managing authentication state.
 * 
 * TRADEOFF NOTE:
 * We are storing the JWT token in `localStorage` to preserve session state across page refreshes.
 * While storing JWTs in `localStorage` exposes them to XSS attacks (unlike HttpOnly cookies),
 * the current backend API contract returns the token in the JSON response payload and does not
 * set HttpOnly cookies. Thus, client-side persistence via localStorage is used for UX continuity,
 * with tokens manually cleared on logout.
 */
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
