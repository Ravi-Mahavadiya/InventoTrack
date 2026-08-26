import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts, useDeleteProduct } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import StatusBadge from "../../components/common/StatusBadge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  Filter,
  X,
  AlertTriangle
} from "lucide-react";

export default function ProductList() {
  // Query parameters state
  const [searchVal, setSearchVal] = useState("");
  const debouncedSearch = useDebounce(searchVal, 300);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal deletion state
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);

  const { data: categories } = useCategories();
  const deleteMutation = useDeleteProduct();

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, statusFilter]);

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useProducts({
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteProductTarget._id);
      setDeleteProductTarget(null);
    } catch (e) {
      // Mutation handles alerts
    }
  };

  const handleClearFilters = () => {
    setSearchVal("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Inventory Products
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Create, search, filter, and manage products.
          </p>
        </div>
        <Link
          to="/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search name or SKU..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" size={14} />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <Filter className="absolute right-3.5 top-3.5 text-zinc-400 pointer-events-none" size={14} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Empty State Wrapper */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader2 className="animate-spin text-emerald-500 mb-2" size={28} />
          <p className="text-sm text-zinc-500">Loading products...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <AlertTriangle size={32} className="text-red-500 mb-3" />
          <p className="font-bold text-zinc-900 dark:text-zinc-50">Error fetching products</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm transition">
            Retry Connection
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <Search size={36} className="text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="font-bold text-zinc-900 dark:text-zinc-50">No products found</p>
          <p className="text-sm text-zinc-400 max-w-xs mt-1">
            Try adjusting your search query, choosing a different category, or adding a new product.
          </p>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">
                    <button
                      onClick={() => handleSortToggle("name")}
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer font-bold uppercase"
                    >
                      <span>Product Name</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">
                    <button
                      onClick={() => handleSortToggle("quantity")}
                      className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer font-bold uppercase"
                    >
                      <span>Stock Qty</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4">
                    <button
                      onClick={() => handleSortToggle("unitPrice")}
                      className="flex items-center gap-1 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer font-bold uppercase"
                    >
                      <span>Unit Price</span>
                      <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-300">
                {products.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 font-medium font-mono text-xs">{item.sku}</td>
                    <td className="px-6 py-4">{item.category?.name || "Uncategorized"}</td>
                    <td className="px-6 py-4 font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4 font-semibold">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/products/${item._id}`}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition"
                          title="View detail"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/products/${item._id}/edit`}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteProductTarget(item)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none"
              >
                <option value={10}>10 items</option>
                <option value={25}>25 items</option>
                <option value={50}>50 items</option>
              </select>
              <span>of {pagination.total} products</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-lg">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Are you sure you want to delete the product <strong className="text-zinc-800 dark:text-zinc-200">"{deleteProductTarget.name}"</strong>?
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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
