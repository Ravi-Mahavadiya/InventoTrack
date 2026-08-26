import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";

/**
 * Widget showing low-stock products.
 * @param {Object} props
 * @param {Array} props.items - List of low-stock products.
 * @param {boolean} [props.isLoading] - Loading state.
 */
export default function LowStockWidget({ items, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/40 rounded animate-pulse" />
              </div>
              <div className="h-6 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Low Stock Alert</h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-2">
            <span className="text-3xl">🎉</span>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">All Stock Good!</p>
            <p className="text-xs text-zinc-500">No low stock items detected.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {items.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-3">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    SKU: {item.sku}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
                    {item.quantity} Left
                  </span>
                  <Link
                    to={`/products/${item._id}`}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition"
                    title="View details"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 5 && (
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
          <Link
            to="/products?status=Low Stock"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
          >
            View all {items.length} low stock items
          </Link>
        </div>
      )}
    </div>
  );
}

LowStockWidget.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      sku: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
};
