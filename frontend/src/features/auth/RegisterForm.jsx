import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../lib/validators";
import { User, Mail, Key, Loader2 } from "lucide-react";

/**
 * RegisterForm component.
 * @param {Object} props
 * @param {function(Object): Promise<void>} props.onSubmit - Submission callback handler.
 * @param {boolean} props.isLoading - Whether registration is in progress.
 */
export default function RegisterForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <User size={16} className="text-zinc-400" />
          <span>Full Name</span>
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="JohnDoe123"
          disabled={isLoading}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
            errors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
        />
        {errors.name && (
          <p className="text-xs font-medium text-red-500 mt-0.5">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Mail size={16} className="text-zinc-400" />
          <span>Email Address</span>
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="name@example.com"
          disabled={isLoading}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
            errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
        />
        {errors.email && (
          <p className="text-xs font-medium text-red-500 mt-0.5">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Key size={16} className="text-zinc-400" />
          <span>Password</span>
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
            errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
        />
        {errors.password && (
          <p className="text-xs font-medium text-red-500 mt-0.5 max-w-sm leading-normal">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Key size={16} className="text-zinc-400" />
          <span>Confirm Password</span>
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
            errors.confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
        />
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-red-500 mt-0.5">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-60 cursor-pointer mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>
    </form>
  );
}
