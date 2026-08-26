import React from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { BarChart3 } from "lucide-react";

/**
 * Recharts component for product counts per category.
 * @param {Object} props
 * @param {Array} props.categories - Array of categories with counts.
 * @param {boolean} [props.isLoading] - Loading state indicator.
 */
export default function CategoryChart({ categories = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-800/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Pre-formatted category counts
  const data = categories.map((cat) => ({
    name: cat.name,
    count: cat.productCount || 0,
  }));

  const chartColors = ["#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/50 mb-6">
        <BarChart3 size={18} className="text-emerald-500" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Stock Distribution</h2>
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-16 space-y-2">
            <BarChart3 size={32} className="text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Data Available</p>
            <p className="text-xs text-zinc-400">Add categories and products to see metrics.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" className="dark:stroke-zinc-800/50" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(16, 185, 129, 0.04)" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

CategoryChart.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      productCount: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};
