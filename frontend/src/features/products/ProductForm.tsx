import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { apiGetCategories } from "../../api";
import type { Product } from "../../types";
import { Image } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  sku: z.string().min(1, "SKU is required").regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, or dashes"),
  categoryId: z.string().min(1, "Select a category"),
  description: z.string().max(500).optional(),
  quantity: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().int().min(0, "Cannot be negative")),
  unitPrice: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(0.01, "Price must be at least $0.01")),
  supplierName: z.string().min(2, "Supplier name required").max(100),
});

export type ProductFormValues = {
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  supplierName: string;
  image?: string;
};

interface ProductFormProps {
  defaultValues?: Product;
  onSubmit: (data: ProductFormValues) => Promise<unknown>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function ProductForm({ defaultValues, onSubmit, onCancel, submitLabel = "Save Product" }: ProductFormProps) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: apiGetCategories });
  const [image, setImage] = useState<string>(defaultValues?.image || "");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          sku: defaultValues.sku,
          categoryId: defaultValues.categoryId,
          description: defaultValues.description,
          quantity: String(defaultValues.quantity),
          unitPrice: String(defaultValues.unitPrice),
          supplierName: defaultValues.supplierName,
        }
      : undefined,
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        sku: defaultValues.sku,
        categoryId: defaultValues.categoryId,
        description: defaultValues.description,
        quantity: String(defaultValues.quantity),
        unitPrice: String(defaultValues.unitPrice),
        supplierName: defaultValues.supplierName,
      });
      setImage(defaultValues.image || "");
    }
  }, [defaultValues, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: any) => {
    await onSubmit({
      ...values,
      image,
    });
  };

  const categoryOptions = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Product Image Uploader Box */}
      <div className="flex flex-col gap-2 bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
        <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Image size={16} className="text-indigo-500" />
          Product Image
        </label>
        <div className="flex items-center gap-4 mt-1">
          {image ? (
            <div className="relative w-20 h-20 rounded-lg border border-slate-200 dark:border-zinc-700 overflow-hidden shrink-0 group">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-lg flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 shrink-0 text-xs gap-1">
              <Image size={20} className="stroke-[1.5]" />
              <span>No Image</span>
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs text-slate-500 dark:text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/40 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-950/60 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">
              Supports JPG, PNG, GIF. Image will be saved as Base64.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product Name *" placeholder='e.g. MacBook Pro 16"' error={errors.name?.message} {...register("name")} />
        <Input
          label="SKU *"
          placeholder="e.g. ELEC-MBP-001"
          error={errors.sku?.message}
          helper="Uppercase letters, numbers, dashes only"
          {...register("sku", { setValueAs: (v: string) => v.toUpperCase() })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Category *" options={categoryOptions} placeholder="Select category" error={errors.categoryId?.message} {...register("categoryId")} />
        <Input label="Supplier Name *" placeholder="e.g. Apple Inc." error={errors.supplierName?.message} {...register("supplierName")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Quantity *" type="number" min="0" placeholder="0" error={errors.quantity?.message} {...register("quantity")} />
        <Input label="Unit Price (USD) *" type="number" step="0.01" min="0.01" placeholder="0.00" error={errors.unitPrice?.message} {...register("unitPrice")} />
      </div>
      <Textarea label="Description" placeholder="Optional product description..." error={errors.description?.message} {...register("description")} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
