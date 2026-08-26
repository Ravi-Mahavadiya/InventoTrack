import React from "react";
import { Link } from "react-router-dom";
import RegisterForm from "../features/auth/RegisterForm";
import { useAuth } from "../features/auth/useAuth";
import { ShieldAlert } from "lucide-react";

export default function Register() {
  const { register: signup, isRegistering } = useAuth();

  const handleRegister = async (data) => {
    try {
      await signup(data);
    } catch (e) {
      // Errors handled in hook mutate triggers
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 transition">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl shadow-sm">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Set up your admin profile for InventoTrack
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl p-8 space-y-6">
          <RegisterForm onSubmit={handleRegister} isLoading={isRegistering} />

          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
