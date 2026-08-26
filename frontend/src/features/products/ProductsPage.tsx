import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ChevronUp, ChevronDown, Pencil, Trash2, Eye, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { StockBadge } from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ProductForm, { type ProductFormValues } from "./ProductForm";
import { apiGetProducts, apiGetCategories, apiCreateProduct, apiUpdateProduct, apiDeleteProduct } from "../../api";
import { formatCurrency, formatDate } from "../../utils/format";
import { useDebounce } from "../../hooks/useDebounce";
import type { Product, StockStatus } from "../../types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

type SortKey = "name" | "quantity" | "unitPrice";

function SortIcon({ field, current, order }: { field: SortKey; current: SortKey; order: "asc" | "desc" }) {
  if (field !== current) return <ChevronUp size={14} className="text-slate-300" />;
  return order === "asc" ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />;
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<StockStatus | "">("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const dSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["products", dSearch, categoryId, status, sortBy, sortOrder, page],
    queryFn: () => apiGetProducts({ search: dSearch, categoryId, status, sortBy, sortOrder, page, pageSize: 10 }),
  });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: apiGetCategories });

  const createMutation = useMutation<unknown, Error, ProductFormValues>({
    mutationFn: (d) => apiCreateProduct(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setCreateOpen(false); toast.success("Product created."); },
    onError: (e) => toast.error(e.message ?? "Error"),
  });

  const updateMutation = useMutation<unknown, Error, { id: string; data: ProductFormValues }>({
    mutationFn: ({ id, data }) => apiUpdateProduct(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setEditProduct(null); toast.success("Product updated."); },
    onError: (e) => toast.error(e.message ?? "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setDeleteId(null); toast.success("Product deleted."); setSelected(new Set()); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  function toggleSort(field: SortKey) {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortOrder("asc"); }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (!data) return;
    if (selected.size === data.data.length) setSelected(new Set());
    else setSelected(new Set(data.data.map((p) => p.id)));
  }

  const categoryOptions = [{ value: "", label: "All Categories" }, ...(categories ?? []).map((c) => ({ value: c.id, label: c.name }))];

  const products = data?.data ?? [];
  const allSelected = products.length > 0 && selected.size === products.length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or SKU…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>
        <Select options={categoryOptions} value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="sm:w-44" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => { setStatus(e.target.value as StockStatus | ""); setPage(1); }} className="sm:w-40" />
        <Button onClick={() => setCreateOpen(true)} icon={<Plus size={15} />}>Add Product</Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
          <span className="text-sm font-medium text-indigo-700">{selected.size} selected</span>
          <Button variant="danger" size="sm" icon={<Trash2 size={13} />}
            onClick={() => { if (selected.size === 1) setDeleteId([...selected][0]); else toast.error("Bulk delete: select one at a time for safety."); }}>
            Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("name")}>
                    Product <SortIcon field="name" current={sortBy} order={sortOrder} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("quantity")}>
                    Qty <SortIcon field="quantity" current={sortBy} order={sortOrder} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("unitPrice")}>
                    Price <SortIcon field="unitPrice" current={sortBy} order={sortOrder} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Added</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={9}>
                        <EmptyState icon={<Package size={40} />} title="No products found" description="Try adjusting your search or filters." />
                      </td>
                    </tr>
                  )
                  : products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{p.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.categoryName}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{p.quantity}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(p.unitPrice)}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{p.supplierName}</td>
                      <td className="px-4 py-3"><StockBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button title="View" onClick={() => navigate(`/products/${p.id}`)} className="p-1.5 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                            <Eye size={15} />
                          </button>
                          <button title="Edit" onClick={() => setEditProduct(p)} className="p-1.5 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button title="Delete" onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {data && data.total > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination total={data.total} page={data.page} pageSize={data.pageSize} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Product" size="lg">
        <ProductForm onSubmit={(d) => createMutation.mutateAsync(d as ProductFormValues)} onCancel={() => setCreateOpen(false)} submitLabel="Create Product" />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductForm
            defaultValues={editProduct}
            onSubmit={(d) => updateMutation.mutateAsync({ id: editProduct.id, data: d as ProductFormValues })}
            onCancel={() => setEditProduct(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Product"
        message="This product will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
