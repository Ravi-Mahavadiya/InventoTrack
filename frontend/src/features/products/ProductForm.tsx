import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { apiGetCategories } from "../../api";
import type { Product } from "../../types";

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
};

interface ProductFormProps {
  defaultValues?: Product;
  onSubmit: (data: ProductFormValues) => Promise<unknown>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function ProductForm({ defaultValues, onSubmit, onCancel, submitLabel = "Save Product" }: ProductFormProps) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: apiGetCategories });

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
    }
  }, [defaultValues, reset]);

  const categoryOptions = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-4">
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
