import React, { useEffect, useState } from "react";
import { apiGetAuditLogs, AuditLog } from "../../api";
import { Search, RefreshCw, History } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";

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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50">
            Created
          </span>
        );
      case "PRODUCT_UPDATED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
            Updated
          </span>
        );
      case "PRODUCT_DELETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
            Deleted
          </span>
        );
      case "STOCK_ADJUSTED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
            Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-700 border border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-750">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by name, SKU or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-colors"
          />
        </div>
        <Select
          options={[
            { value: "ALL", label: "All Actions" },
            { value: "PRODUCT_CREATED", label: "Created" },
            { value: "PRODUCT_UPDATED", label: "Updated" },
            { value: "PRODUCT_DELETED", label: "Deleted" },
            { value: "STOCK_ADJUSTED", label: "Stock Adjusted" },
          ]}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="sm:w-48"
        />
        <Button
          onClick={fetchLogs}
          variant="secondary"
          icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
        >
          Reload
        </Button>
      </div>

      {/* Log Count summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filteredLogs.length} logs total</p>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-slate-500 mt-2 text-sm">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={<History size={36} />}
            title="No activity logs found"
            description="Changes to products or stock levels will generate log records here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Action", "Product / SKU", "Audit Details", "Performed By", "Timestamp"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {/* Action badge */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Product metadata */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{log.productName}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{log.sku}</p>
                    </td>

                    {/* Detail diff text */}
                    <td className="px-5 py-3 max-w-xs break-words leading-relaxed text-slate-600 dark:text-slate-300">
                      {log.details}
                    </td>

                    {/* Performed by */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-slate-800">{log.user.name}</p>
                          <p className="text-xs text-slate-450">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">System Automated</span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
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
