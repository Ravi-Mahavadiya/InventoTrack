import type { StockStatus } from "../types";

export function computeStatus(quantity: number): StockStatus {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= 10) return "low_stock";
  return "in_stock";
}

export const STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export const STATUS_COLORS: Record<StockStatus, string> = {
  in_stock: "bg-emerald-100 text-emerald-700",
  low_stock: "bg-amber-100 text-amber-700",
  out_of_stock: "bg-red-100 text-red-700",
};
