import React from "react";
import PropTypes from "prop-types";

/**
 * StatCard component to display single metrics.
 * @param {Object} props
 * @param {string} props.title - Card title.
 * @param {string|number} props.value - Metric value.
 * @param {string} [props.subtext] - Metric subtext or description.
 * @param {React.ReactNode} props.icon - Lucide icon component.
 * @param {boolean} [props.isLoading] - Loading/skeleton state.
 * @param {string} [props.variant] - Visual theme variant (emerald, amber, red, indigo, zinc).
 */
export default function StatCard({
  title,
  value,
  subtext,
  icon,
  isLoading = false,
  variant = "zinc",
}) {
  const themes = {
    zinc: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400",
    emerald: "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/30 text-amber-600 dark:text-amber-400",
    red: "bg-red-50/50 dark:bg-red-950/10 border-red-200/60 dark:border-red-900/30 text-red-600 dark:text-red-400",
    indigo: "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200/60 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-3 animate-pulse shadow-sm">
        <div className="flex justify-between items-center">
          <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-zinc-300 dark:bg-zinc-700 rounded" />
        <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition hover:shadow-md ${themes[variant] || themes.zinc}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium opacity-80 text-zinc-500 dark:text-zinc-400">{title}</h3>
        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 shadow-sm text-current">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {value}
        </p>
        {subtext && (
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtext: PropTypes.string,
  icon: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(["zinc", "emerald", "amber", "red", "indigo"]),
};
