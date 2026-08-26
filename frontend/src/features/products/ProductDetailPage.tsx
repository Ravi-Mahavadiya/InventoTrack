import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { StockBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import ProductForm, { type ProductFormValues } from "./ProductForm";
import { apiGetProduct, apiUpdateProduct, apiDeleteProduct } from "../../api";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiGetProduct(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation<unknown, Error, ProductFormValues>({
    mutationFn: (data) => apiUpdateProduct(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product", id] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditOpen(false);
      toast.success("Product updated.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDeleteProduct(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted.");
      navigate("/products");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) return <p className="text-slate-500">Product not found.</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/products")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
          <p className="text-sm font-mono text-slate-400">{product.sku}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>

      {/* Status banner */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Package size={22} className="text-indigo-500" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-900">{product.quantity} <span className="text-base font-normal text-slate-500">units</span></p>
          <p className="text-sm text-slate-500 mt-0.5">Current stock quantity</p>
        </div>
        <StockBadge status={product.status} />
      </div>

      {/* Details grid */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
        <Field label="Product Name" value={product.name} />
        <Field label="SKU" value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{product.sku}</span>} />
        <Field label="Category" value={product.categoryName} />
        <Field label="Unit Price" value={<span className="font-semibold text-slate-900">{formatCurrency(product.unitPrice)}</span>} />
        <Field label="Supplier" value={product.supplierName} />
        <Field label="Status" value={<StockBadge status={product.status} />} />
        <Field label="Date Added" value={formatDate(product.createdAt)} />
        <Field label="Last Updated" value={formatDateTime(product.updatedAt)} />
        {product.description && (
          <div className="col-span-2 md:col-span-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Product" size="lg">
        <ProductForm
          defaultValues={product}
          onSubmit={(d) => updateMutation.mutateAsync(d as ProductFormValues)}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
