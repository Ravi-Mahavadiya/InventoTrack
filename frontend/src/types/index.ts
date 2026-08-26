export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  supplierName: string;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  operation: "increase" | "reduce";
  amount: number;
  note?: string;
  adjustedBy: string;
  previousQty: number;
  newQty: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: StockStatus | "";
  sortBy?: "name" | "quantity" | "unitPrice";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalStockQty: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topProducts: { name: string; quantity: number }[];
  categoryDistribution: { name: string; count: number }[];
  recentProducts: Product[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  confirmPassword: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  supplierName: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface StockAdjustData {
  operation: "increase" | "reduce";
  amount: number;
  note?: string;
}
