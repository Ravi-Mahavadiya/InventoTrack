import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../../lib/validators";
import { useProduct, useCreateProduct, useUpdateProduct } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { Loader2, ArrowLeft, Save } from "lucide-react";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: product, isLoading: isProductLoading } = useProduct(id);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      quantity: 0,
      lowStockThreshold: 5,
      unitPrice: 0.0,
      supplierName: "",
    },
  });

  // Reset/populate form values when data becomes available in edit mode
  useEffect(() => {
    if (isEdit && product) {
      reset({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category?._id || product.category || "",
        description: product.description || "",
        quantity: product.quantity ?? 0,
        lowStockThreshold: product.lowStockThreshold ?? 5,
        unitPrice: product.unitPrice ?? 0.0,
        supplierName: product.supplierName || "",
      });
    }
  }, [isEdit, product, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (e) {
      // Mutation handles error toasts
    }
  };

  const isLoadingData = isCategoriesLoading || (isEdit && isProductLoading);
  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 mb-2" size={28} />
        <p className="text-sm text-zinc-500">Loading product configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="p-2 border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {isEdit ? "Modify product configuration settings" : "Create a new inventory registry product item"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Product Name</label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Wireless Gaming Mouse"
                disabled={isMutating}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.name ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
              />
              {errors.name && <p className="text-xs font-semibold text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">SKU Code</label>
              <input
                {...register("sku")}
                type="text"
                placeholder="e.g. ELEC-MOUS-102"
                disabled={isMutating}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.sku ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
              />
              {errors.sku && <p className="text-xs font-semibold text-red-500 mt-1">{errors.sku.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
              <select
                {...register("category")}
                disabled={isMutating}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.category ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs font-semibold text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {/* Supplier Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Supplier Name</label>
              <input
                {...register("supplierName")}
                type="text"
                placeholder="e.g. Logitech Global Sales"
                disabled={isMutating}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.supplierName ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
              />
              {errors.supplierName && <p className="text-xs font-semibold text-red-500 mt-1">{errors.supplierName.message}</p>}
            </div>

            {/* Unit Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Unit Price ($)</label>
              <input
                {...register("unitPrice", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="49.99"
                disabled={isMutating}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.unitPrice ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
              />
              {errors.unitPrice && <p className="text-xs font-semibold text-red-500 mt-1">{errors.unitPrice.message}</p>}
            </div>

            {/* Stock Quantity - Only editable during creation */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Initial Stock Quantity</label>
              <input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="100"
                disabled={isEdit || isMutating} // Force edit stock level adjustment via adjustment modal
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.quantity ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm ${isEdit ? "bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed opacity-80" : ""}`}
              />
              {isEdit && (
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  Stock levels must be updated via the Stock Adjustment panel in product details.
                </p>
              )}
              {errors.quantity && <p className="text-xs font-semibold text-red-500 mt-1">{errors.quantity.message}</p>}
            </div>

            {/* Low Stock Threshold */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Low Stock Threshold</label>
              <input
                {...register("lowStockThreshold", { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="10"
                disabled={isMutating}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                  errors.lowStockThreshold ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
              />
              {errors.lowStockThreshold && <p className="text-xs font-semibold text-red-500 mt-1">{errors.lowStockThreshold.message}</p>}
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Product Description</label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Provide a detailed description of the product attributes, materials, and specification details..."
              disabled={isMutating}
              className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                errors.description ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-50 text-sm`}
            />
            {errors.description && <p className="text-xs font-semibold text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              to="/products"
              className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isMutating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg text-sm shadow-sm transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isMutating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? "Update Product" : "Create Product"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
