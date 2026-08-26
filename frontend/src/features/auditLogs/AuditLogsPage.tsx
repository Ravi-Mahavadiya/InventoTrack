import React, { useEffect, useState } from "react";
import { apiGetAuditLogs, AuditLog } from "../../api";
import { 
  History, 
  Search, 
  RefreshCw, 
  User, 
  Activity, 
  Tag, 
  AlertCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  async function fetchLogs() {
    setLoading(true);
    try {
      const data = await apiGetAuditLogs();
      setLogs(data);
    } catch (e) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.productName.toLowerCase().includes(search.toLowerCase()) ||
      log.sku.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "PRODUCT_CREATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
            Created
          </span>
        );
      case "PRODUCT_UPDATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"></span>
            Updated
          </span>
        );
      case "PRODUCT_DELETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400"></span>
            Deleted
          </span>
        );
      case "STOCK_ADJUSTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            Stock Adjusted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <History className="text-indigo-600 dark:text-indigo-400" size={26} />
            Inventory Audit Logs
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track real-time history of inventory adjustments, creations, edits, and deletions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Reload logs
        </button>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-155 dark:border-zinc-800 shadow-sm transition-colors duration-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search by Product Name, SKU, User or action details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-705 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/10 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-705 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="PRODUCT_CREATED">Created</option>
            <option value="PRODUCT_UPDATED">Updated</option>
            <option value="PRODUCT_DELETED">Deleted</option>
            <option value="STOCK_ADJUSTED">Stock Adjusted</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-200">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-700">
              <AlertCircle className="text-zinc-400 dark:text-zinc-500" size={24} />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-white">No logs found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Try adjusting your query filter keywords or trigger new operations to populate the audit logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-155 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Product Name / SKU</th>
                  <th className="px-6 py-4">Audit Details</th>
                  <th className="px-6 py-4">Performed By</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-155 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log._id}
                    className="hover:bg-zinc-50/20 dark:hover:bg-zinc-800/10 transition-colors duration-150"
                  >
                    {/* Action Badge */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Product Metadata */}
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Tag size={14} className="text-zinc-400" />
                        {log.productName}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">{log.sku}</div>
                    </td>

                    {/* Diff Details */}
                    <td className="px-6 py-4.5 max-w-sm">
                      <div className="text-zinc-600 dark:text-zinc-300 break-words leading-relaxed">
                        {log.details}
                      </div>
                    </td>

                    {/* User profile */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                            <User size={13} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-white leading-tight">
                              {log.user.name}
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5">
                              {log.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Activity size={14} />
                          <span className="text-xs font-medium">System Automated</span>
                        </div>
                      )}
                    </td>

                    {/* Formatted Date */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400 text-xs">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
