import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Product name is required" }).min(1, "Product name cannot be empty"),
    sku: z.string({ required_error: "SKU is required" }).min(2, "SKU must be at least 2 characters"),
    category: z.string({ required_error: "Category ID is required" }).min(1, "Category is required"),
    description: z.string().optional(),
    quantity: z.number({ required_error: "Quantity is required" }).min(0, "Quantity cannot be negative"),
    lowStockThreshold: z.number().min(0, "Threshold cannot be negative").optional(),
    unitPrice: z.number({ required_error: "Unit price is required" }).min(0.01, "Unit price must be greater than zero"),
    supplierName: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().min(1).optional(),
    description: z.string().optional(),
    quantity: z.number().min(0, "Quantity cannot be negative").optional(),
    lowStockThreshold: z.number().min(0).optional(),
    unitPrice: z.number().min(0.01, "Unit price must be greater than zero").optional(),
    supplierName: z.string().optional(),
    image: z.string().optional(),
  }),
});
