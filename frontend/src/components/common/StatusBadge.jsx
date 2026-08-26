import React from "react";
import PropTypes from "prop-types";

/**
 * StatusBadge component to display stock status with styling.
 * @param {Object} props
 * @param {string} props.status - The status value.
 */
export default function StatusBadge({ status }) {
  const styles = {
    "In Stock": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30",
    "Low Stock": "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
    "Out of Stock": "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
  };

  const currentStyle = styles[status] || "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${currentStyle}`}>
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
