import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpCircle, ArrowDownCircle, History, Search } from "lucide-react";
import toast from "react-hot-toast";
import { StockBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import { apiGetProducts, apiGetStockTransactions, apiAdjustStock } from "../../api";
import { formatDateTime } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import { useDebounce } from "../../hooks/useDebounce";
import type { Product, StockStatus } from "../../types";
import { cn } from "../../utils/cn";

const adjustSchema = z.object({
  operation: z.enum(["increase", "reduce"]),
  amount: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().int().min(1, "Amount must be at least 1")),
  note: z.string().max(200).optional(),
});

type AdjustRaw = { operation: "increase" | "reduce"; amount: string; note?: string };
type AdjustOut = { operation: "increase" | "reduce"; amount: number; note?: string };

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

function AdjustModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AdjustRaw>({
    resolver: zodResolver(adjustSchema) as any,
    defaultValues: { operation: "increase", amount: "", note: "" },
  });

  const op = watch("operation");
  const amount = parseInt(watch("amount") || "0", 10);
  const newQty = op === "increase" ? product.quantity + (isNaN(amount) ? 0 : amount) : product.quantity - (isNaN(amount) ? 0 : amount);

  const mutation = useMutation({
    mutationFn: (data: AdjustOut) => apiAdjustStock(product.id, data, user?.name ?? "Admin"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stock-transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock adjusted successfully.");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutateAsync(d as unknown as AdjustOut))} className="space-y-5">
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-500 uppercase font-medium tracking-wide mb-1">Product</p>
        <p className="font-semibold text-slate-800">{product.name}</p>
        <p className="text-xs font-mono text-slate-400">{product.sku}</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{product.quantity}</p>
            <p className="text-xs text-slate-500">Current</p>
          </div>
          <span className="text-slate-300">→</span>
          <div className="text-center">
            <p className={cn("text-2xl font-bold", newQty < 0 ? "text-red-500" : "text-indigo-600")}>{isNaN(newQty) ? "—" : newQty}</p>
            <p className="text-xs text-slate-500">After</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Operation</p>
        <div className="grid grid-cols-2 gap-2">
          {(["increase", "reduce"] as const).map((opValue) => (
            <label key={opValue} className={cn("flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
              op === opValue ? (opValue === "increase" ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50") : "border-slate-200 hover:border-slate-300")}>
              <input type="radio" value={opValue} {...register("operation")} className="sr-only" />
              {opValue === "increase" ? <ArrowUpCircle size={18} className="text-emerald-500" /> : <ArrowDownCircle size={18} className="text-red-500" />}
              <span className={cn("text-sm font-medium capitalize", opValue === "increase" ? "text-emerald-700" : "text-red-700")}>{opValue}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Amount *</label>
        <input
          type="number"
          min="1"
          placeholder="Enter quantity"
          {...register("amount")}
          className="w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Note (optional)</label>
        <input
          type="text"
          placeholder="Reason for adjustment…"
          {...register("note")}
          className="w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {newQty < 0 && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Cannot reduce stock below zero. Current stock: {product.quantity}.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={isSubmitting} disabled={newQty < 0}>Apply Adjustment</Button>
      </div>
    </form>
  );
}

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "">("");
  const [activeTab, setActiveTab] = useState<"inventory" | "history">("inventory");
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const dSearch = useDebounce(search, 300);

  const { data: productsData } = useQuery({
    queryKey: ["products-stock", dSearch, statusFilter],
    queryFn: () => apiGetProducts({ search: dSearch, status: statusFilter, pageSize: 100 }),
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["stock-transactions"],
    queryFn: apiGetStockTransactions,
  });

  const products = productsData?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(["inventory", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {tab === "inventory" ? "Inventory" : "Stock History"}
          </button>
        ))}
      </div>

      {activeTab === "inventory" && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
            </div>
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StockStatus | "")} className="w-40" />
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Product", "SKU", "Category", "Current Stock", "Status", "Last Updated", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="px-5 py-3 text-slate-600">{p.categoryName}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold text-slate-900">{p.quantity}</span>
                      <span className="text-slate-400 text-xs ml-1">units</span>
                    </td>
                    <td className="px-5 py-3"><StockBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{formatDateTime(p.updatedAt)}</td>
                    <td className="px-5 py-3">
                      <Button variant="secondary" size="sm" icon={<ArrowUpCircle size={13} />} onClick={() => setAdjustProduct(p)}>Adjust</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <History size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Stock Adjustment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Product", "SKU", "Operation", "Amount", "Before → After", "Note", "By", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded" /></td>)}
                    </tr>
                  ))
                  : (transactions ?? []).map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{tx.productName}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-400">{tx.productSku}</td>
                      <td className="px-5 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          tx.operation === "increase" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                          {tx.operation === "increase" ? <ArrowUpCircle size={11} /> : <ArrowDownCircle size={11} />}
                          {tx.operation}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-slate-700">
                        {tx.operation === "increase" ? "+" : "-"}{tx.amount}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{tx.previousQty} → {tx.newQty}</td>
                      <td className="px-5 py-3 text-slate-500 max-w-[180px] truncate">{tx.note || <span className="italic text-slate-300">—</span>}</td>
                      <td className="px-5 py-3 text-slate-600">{tx.adjustedBy}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!adjustProduct} onClose={() => setAdjustProduct(null)} title="Adjust Stock" size="sm">
        {adjustProduct && <AdjustModal product={adjustProduct} onClose={() => setAdjustProduct(null)} />}
      </Modal>
    </div>
  );
}
