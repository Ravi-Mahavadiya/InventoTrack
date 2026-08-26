import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../features/auth/LoginForm";
import { useAuth } from "../features/auth/useAuth";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  const { login, isLoggingIn } = useAuth();

  const handleLogin = async (data) => {
    try {
      await login(data);
    } catch (e) {
      // Errors are handled inside hook mutate triggers
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 transition">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your InventoTrack control panel
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl p-8 space-y-6">
          <LoginForm onSubmit={handleLogin} isLoading={isLoggingIn} />

          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
