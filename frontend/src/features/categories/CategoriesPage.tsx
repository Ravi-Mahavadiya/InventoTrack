import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from "../../api";
import { formatDate } from "../../utils/format";
import type { Category } from "../../types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
});
type FormData = z.infer<typeof schema>;

function CategoryForm({ defaultValues, onSubmit, onCancel }: { defaultValues?: Category; onSubmit: (d: FormData) => Promise<unknown>; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ? { name: defaultValues.name, description: defaultValues.description } : undefined,
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Category Name *" placeholder="e.g. Electronics" error={errors.name?.message} {...register("name")} />
      <Textarea label="Description" placeholder="Optional description…" error={errors.description?.message} {...register("description")} />
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{defaultValues ? "Save Changes" : "Create Category"}</Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: apiGetCategories });

  const createMut = useMutation<unknown, Error, FormData>({
    mutationFn: (d) => apiCreateCategory(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setCreateOpen(false); toast.success("Category created."); },
    onError: (e) => toast.error(e.message ?? "Error"),
  });

  const updateMut = useMutation<unknown, Error, { id: string; data: FormData }>({
    mutationFn: ({ id, data }) => apiUpdateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setEditCat(null); toast.success("Category updated."); },
    onError: (e) => toast.error(e.message ?? "Error"),
  });

  const deleteMut = useMutation<unknown, Error, string>({
    mutationFn: (id) => apiDeleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); qc.invalidateQueries({ queryKey: ["products"] }); setDeleteId(null); toast.success("Category deleted."); },
    onError: (e) => toast.error(e.message ?? "Error"),
  });

  const deleteTarget = categories?.find((c) => c.id === deleteId);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{categories?.length ?? 0} categories total</p>
        <Button icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>Add Category</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {["Category", "Description", "Products", "Created", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
              : (categories ?? []).length === 0
                ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={<Tag size={36} />} title="No categories yet" description="Create your first category to organize products." />
                    </td>
                  </tr>
                )
                : (categories ?? []).map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{cat.name}</td>
                    <td className="px-5 py-3 text-slate-500 max-w-[240px] truncate">{cat.description || <span className="italic text-slate-300">No description</span>}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(cat.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button title="Edit" onClick={() => setEditCat(cat)} className="p-1.5 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button title="Delete" onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Category" size="sm">
        <CategoryForm onSubmit={(d) => createMut.mutateAsync(d)} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editCat} onClose={() => setEditCat(null)} title="Edit Category" size="sm">
        {editCat && (
          <CategoryForm
            defaultValues={editCat}
            onSubmit={(d) => updateMut.mutateAsync({ id: editCat.id, data: d })}
            onCancel={() => setEditCat(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        title="Delete Category"
        message={
          deleteTarget?.productCount
            ? `"${deleteTarget.name}" has ${deleteTarget.productCount} product(s) assigned. You must reassign or delete them before deleting this category.`
            : `Delete category "${deleteTarget?.name}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
