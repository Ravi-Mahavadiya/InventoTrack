import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct, useDeleteProduct } from "../../hooks/useProducts";
import StatusBadge from "../../components/common/StatusBadge";
import StockAdjustModal from "../inventory/StockAdjustModal";
import {
  ArrowLeft,
  Edit,
  SlidersHorizontal,
  Trash2,
  Calendar,
  Layers,
  Tag,
  DollarSign,
  Boxes,
  Truck,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/products");
    } catch (e) {
      // Handled in mutation hook toast
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 mb-2" size={28} />
        <p className="text-sm text-zinc-500">Loading product details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
        <AlertTriangle size={32} className="text-red-500 mb-3" />
        <p className="font-bold text-zinc-900 dark:text-zinc-50">Error fetching product details</p>
        <button onClick={refetch} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm transition">
          Retry Connection
        </button>
      </div>
    );
  }

  // Format dates
  const createdDate = product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A";
  const updatedDate = product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "N/A";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Product Overview
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Detailed registry parameters for the product
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAdjustOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg text-sm transition cursor-pointer"
          >
            <SlidersHorizontal size={16} />
            <span>Adjust Stock</span>
          </button>
          <Link
            to={`/products/${product._id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
          >
            <Edit size={16} />
            <span>Edit Configurations</span>
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold rounded-lg text-sm transition cursor-pointer"
          >
            <Trash2 size={16} />
            <span>Delete Registry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
            
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{product.name}</h2>
                <p className="text-xs font-semibold font-mono text-zinc-400 mt-1">SKU: {product.sku}</p>
              </div>
              <StatusBadge status={product.status} />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <span>Description</span>
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided for this product."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 text-zinc-400">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400">Category</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 text-zinc-400">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400">Supplier</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {product.supplierName || "N/A"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Stock & Pricing Parameters</h3>
            
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
              <div className="flex justify-between py-3">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Boxes size={14} />
                  <span>Current Stock</span>
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">{product.quantity}</span>
              </div>
              
              <div className="flex justify-between py-3">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <DollarSign size={14} />
                  <span>Unit Price</span>
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">
                  ${product.unitPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Tag size={14} />
                  <span>Low Threshold</span>
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">
                  {product.lowStockThreshold}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">System Logs</h3>
            <div className="space-y-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>Created: {createdDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>Last Updated: {updatedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        product={product}
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-lg">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Are you sure you want to delete the product <strong className="text-zinc-800 dark:text-zinc-200">"{product.name}"</strong>?
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium rounded-lg text-sm shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
