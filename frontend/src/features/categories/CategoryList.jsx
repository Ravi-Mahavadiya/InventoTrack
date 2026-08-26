import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../../lib/validators";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from "../../hooks/useCategories";
import { Plus, Edit, Trash2, X, Loader2, FolderTree, AlertTriangle } from "lucide-react";

export default function CategoryList() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Dialog and form states
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form for creation
  const createForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  // Form for editing
  const editForm = useForm({
    resolver: zodResolver(categorySchema),
  });

  const handleCreateSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      createForm.reset();
      setIsCreateOpen(false);
    } catch (e) {
      // Toast notification handled in mutation hook
    }
  };

  const handleEditInit = (category) => {
    setEditingCategory(category);
    editForm.reset({
      name: category.name || "",
      description: category.description || "",
    });
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({ id: editingCategory._id, data });
      setEditingCategory(null);
    } catch (e) {
      // Toast notification handled in mutation hook
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(deletingCategory._id);
      setDeletingCategory(null);
    } catch (e) {
      // Toast notification handled in mutation hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <Loader2 className="animate-spin text-emerald-500 mb-2" size={28} />
        <p className="text-sm text-zinc-500">Loading category registries...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
        <AlertTriangle size={32} className="text-red-500 mb-3" />
        <p className="font-bold text-zinc-900 dark:text-zinc-50">Error fetching categories</p>
        <button onClick={refetch} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm transition">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Inventory Categories
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage product segmentation categories and classifications.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <FolderTree size={36} className="text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="font-bold text-zinc-900 dark:text-zinc-50">No categories found</p>
          <p className="text-sm text-zinc-400 max-w-xs mt-1">
            Create a category registry list to organize inventory product classifications.
          </p>
        </div>
      ) : (
        /* Categories Table */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Products Assigned</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-300">
                {categories.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{item.slug}</td>
                    <td className="px-6 py-4 max-w-md truncate text-zinc-500 dark:text-zinc-400">
                      {item.description || <em className="text-zinc-300">No description</em>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {item.productCount ?? 0} Products
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEditInit(item)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(item)}
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
        </div>
      )}

      {/* Create Category Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-[460px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Create New Category</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category Name</label>
                <input
                  {...createForm.register("name")}
                  type="text"
                  placeholder="e.g. Home Appliances"
                  disabled={createMutation.isPending}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                    createForm.formState.errors.name ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                  } rounded-lg text-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
                />
                {createForm.formState.errors.name && (
                  <p className="text-xs font-semibold text-red-500 mt-1">{createForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  {...createForm.register("description")}
                  rows={3}
                  placeholder="Classifies refrigerators, cooking ranges, etc."
                  disabled={createMutation.isPending}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 rounded-lg text-sm focus:outline-none focus:ring-2 transition disabled:opacity-50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-[460px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Edit Category Classification</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category Name</label>
                <input
                  {...editForm.register("name")}
                  type="text"
                  disabled={updateMutation.isPending}
                  className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
                    editForm.formState.errors.name ? "border-red-500 focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500"
                  } rounded-lg text-sm focus:outline-none focus:ring-2 transition disabled:opacity-50`}
                />
                {editForm.formState.errors.name && (
                  <p className="text-xs font-semibold text-red-500 mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  {...editForm.register("description")}
                  rows={3}
                  disabled={updateMutation.isPending}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-emerald-500 rounded-lg text-sm focus:outline-none focus:ring-2 transition disabled:opacity-50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-lg">Confirm Deletion</h3>
            </div>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Are you sure you want to delete the category <strong className="text-zinc-800 dark:text-zinc-200">"{deletingCategory.name}"</strong>?
            </p>

            {deletingCategory.productCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex gap-2 text-amber-800 dark:text-amber-400 text-xs">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="font-semibold leading-normal">
                  Warning: There are {deletingCategory.productCount} product(s) assigned to this category. The backend server will reject deletion until these products are reassigned or deleted.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
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
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
