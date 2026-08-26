import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .regex(/^[A-Za-z0-9]+$/, "Name can only contain letters and numbers"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/,
        "Password must be 6-15 characters, including uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  quantity: z.number({ invalid_type_error: "Quantity must be a number" }).min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number({ invalid_type_error: "Threshold must be a number" }).min(0, "Threshold cannot be negative"),
  unitPrice: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price cannot be negative"),
  supplierName: z.string().min(1, "Supplier name is required"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});
