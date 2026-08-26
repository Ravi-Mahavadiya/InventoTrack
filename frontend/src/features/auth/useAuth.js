import { useMutation } from "@tanstack/react-query";
import { login as loginApi, register as registerApi } from "../../api/auth";
import { useAuthStore } from "./auth.store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook providing authentication mutations and query functions.
 */
export function useAuth() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Welcome back! Login successful.");
      navigate("/dashboard");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Login failed. Please check credentials.";
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Registration failed.";
      toast.error(msg);
    },
  });

  const logout = () => {
    clearAuth();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
