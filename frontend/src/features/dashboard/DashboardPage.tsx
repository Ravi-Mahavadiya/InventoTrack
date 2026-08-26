import { useQuery } from "@tanstack/react-query";
import { Package, Tag, ArchiveX, AlertTriangle, Layers, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { apiGetDashboardStats } from "../../api";
import { StockBadge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/format";

const PIE_COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: number | string; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-start gap-4">
      <div className="skeleton w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <div className="skeleton h-7 w-16 rounded mb-2" />
        <div className="skeleton h-4 w-28 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: apiGetDashboardStats });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Products" value={data!.totalProducts} icon={Package} color="bg-indigo-500" />
            <StatCard label="Categories" value={data!.totalCategories} icon={Tag} color="bg-cyan-500" />
            <StatCard label="Total Stock" value={data!.totalStockQty.toLocaleString()} icon={Layers} color="bg-emerald-500" sub="units across all products" />
            <StatCard label="Inventory Value" value={formatCurrency(data!.totalValue)} icon={Layers} color="bg-emerald-600" sub="total stock value" />
            <StatCard label="Low Stock" value={data!.lowStockItems} icon={AlertTriangle} color="bg-amber-500" sub="need restocking" />
            <StatCard label="Out of Stock" value={data!.outOfStockItems} icon={ArchiveX} color="bg-red-500" sub="require immediate action" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-900">Top Products by Stock Quantity</h3>
          </div>
          {isLoading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data!.topProducts} margin={{ top: 0, right: 0, bottom: 30, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="quantity" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-900">Products by Category</h3>
          </div>
          {isLoading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={data!.categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="45%" outerRadius={70} innerRadius={35}>
                  {data!.categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Recently Added Products</h3>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Product", "SKU", "Category", "Qty", "Price", "Status", "Added"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.recentProducts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="px-5 py-3 text-slate-600">{p.categoryName}</td>
                    <td className="px-5 py-3 font-mono text-slate-700">{p.quantity}</td>
                    <td className="px-5 py-3 text-slate-700">{formatCurrency(p.unitPrice)}</td>
                    <td className="px-5 py-3"><StockBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
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
