import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/validators";
import { Mail, Key, Loader2 } from "lucide-react";

/**
 * LoginForm component.
 * @param {Object} props
 * @param {function(Object): Promise<void>} props.onSubmit - Submission callback handler.
 * @param {boolean} props.isLoading - Whether submission is in progress.
 */
export default function LoginForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Mail size={16} className="text-zinc-400" />
          <span>Email Address</span>
        </label>
        <div className="relative">
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
            className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
              errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
          />
        </div>
        {errors.email && (
          <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Key size={16} className="text-zinc-400" />
          <span>Password</span>
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
              errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
          />
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}
