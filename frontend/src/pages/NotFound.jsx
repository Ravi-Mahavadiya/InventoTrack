import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 text-center">
      <div className="h-16 w-16 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-2xl shadow-sm mb-4">
        <HelpCircle size={36} />
      </div>
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">404</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">Page not found</p>
      <p className="text-zinc-400 dark:text-zinc-505 max-w-sm mt-1">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-sm transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
