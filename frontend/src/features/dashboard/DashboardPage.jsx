import React from "react";
import { useDashboard } from "../../hooks/useDashboard";
import { useCategories } from "../../hooks/useCategories";
import StatCard from "./StatCard";
import LowStockWidget from "./LowStockWidget";
import CategoryChart from "./CategoryChart";
import {
  Package,
  FolderTree,
  Boxes,
  AlertCircle,
  TrendingDown,
  RotateCw
} from "lucide-react";

export default function DashboardPage() {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useDashboard();

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const handleRetry = () => {
    refetchDashboard();
    refetchCategories();
  };

  const isLoading = isDashboardLoading || isCategoriesLoading;
  const isError = isDashboardError || isCategoriesError;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="h-14 w-14 flex items-center justify-center bg-red-50 dark:bg-red-950/15 text-red-500 rounded-full mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Failed to load dashboard metrics
        </h2>
        <p className="text-sm text-zinc-500 max-w-sm mt-2">
          There was an error communicating with the server. Please check your network connection and try again.
        </p>
        <button
          onClick={handleRetry}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-sm transition cursor-pointer"
        >
          <RotateCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500 mt-1.5 text-sm">
          Real-time summary statistics and alerts for your inventory.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Products"
          value={summary.totalProducts ?? 0}
          icon={<Package size={20} className="text-zinc-500 dark:text-zinc-400" />}
          isLoading={isLoading}
          variant="zinc"
        />
        <StatCard
          title="Total Categories"
          value={summary.totalCategories ?? 0}
          icon={<FolderTree size={20} className="text-indigo-500" />}
          isLoading={isLoading}
          variant="indigo"
        />
        <StatCard
          title="Total Items Stocked"
          value={summary.totalStockQuantity ?? 0}
          subtext={`Valued at $${(summary.totalInventoryValue ?? 0).toLocaleString()}`}
          icon={<Boxes size={20} className="text-emerald-500" />}
          isLoading={isLoading}
          variant="emerald"
        />
        <StatCard
          title="Low Stock Items"
          value={summary.lowStockCount ?? 0}
          icon={<TrendingDown size={20} className="text-amber-500" />}
          isLoading={isLoading}
          variant="amber"
        />
        <StatCard
          title="Out of Stock"
          value={summary.outOfStockCount ?? 0}
          icon={<AlertCircle size={20} className="text-red-500" />}
          isLoading={isLoading}
          variant="red"
        />
      </div>

      {/* Visualizations and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2">
          <CategoryChart categories={categoriesData || []} isLoading={isLoading} />
        </div>
        <div>
          <LowStockWidget items={dashboardData?.lowStockItems || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
