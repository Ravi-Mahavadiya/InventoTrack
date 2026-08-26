import client from "./client";
import type {
  Category,
  CategoryFormData,
  DashboardStats,
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductFormData,
  StockAdjustData,
  StockTransaction,
  User,
  StockStatus,
} from "../types";

// --- Status Mappings ---
const mapStatusToFrontend = (status: string): StockStatus => {
  if (status === "Low Stock") return "low_stock";
  if (status === "Out of Stock") return "out_of_stock";
  return "in_stock";
};

const mapStatusToBackend = (status?: string): string | undefined => {
  if (status === "low_stock") return "Low Stock";
  if (status === "out_of_stock") return "Out of Stock";
  if (status === "in_stock") return "In Stock";
  return undefined;
};

// --- Entity Mappers ---
const mapProduct = (p: any): Product => ({
  id: p._id,
  name: p.name,
  sku: p.sku,
  categoryId: p.category?._id || p.category || "",
  categoryName: p.category?.name || "Uncategorized",
  description: p.description,
  quantity: p.quantity,
  unitPrice: p.unitPrice,
  supplierName: p.supplierName,
  status: mapStatusToFrontend(p.status),
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

const mapCategory = (c: any): Category => ({
  id: c._id,
  name: c.name,
  description: c.description,
  productCount: c.productCount || 0,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

const mapTransaction = (t: any): StockTransaction => ({
  id: t._id,
  productId: t.product?._id || t.product || "",
  productName: t.product?.name || "Deleted Product",
  productSku: t.product?.sku || "",
  operation: t.type === "INCREASE" ? "increase" : "reduce",
  amount: t.quantity,
  note: t.reason,
  adjustedBy: t.user?.name || "System",
  previousQty: t.previousQuantity,
  newQty: t.newQuantity,
  createdAt: t.createdAt,
});

// --- Auth ---
export async function apiLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  const { data } = await client.post("/auth/login", { email, password });
  const resData = data.data;
  return {
    user: {
      id: resData.user._id,
      name: resData.user.name,
      email: resData.user.email,
      createdAt: resData.user.createdAt,
    },
    token: resData.token,
  };
}

export async function apiRegister(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const { data } = await client.post("/auth/register", { name, email, password });
  const resData = data.data;
  return {
    user: {
      id: resData.user._id,
      name: resData.user.name,
      email: resData.user.email,
      createdAt: resData.user.createdAt,
    },
    token: resData.token,
  };
}

// --- Dashboard ---
export async function apiGetDashboardStats(): Promise<DashboardStats> {
  const [dbSummaryRes, recentProductsRes, categoriesRes, topProductsRes] = await Promise.all([
    client.get("/dashboard"),
    client.get("/products", { params: { sortBy: "createdAt", sortOrder: "desc", limit: 10 } }),
    client.get("/categories"),
    client.get("/products", { params: { sortBy: "quantity", sortOrder: "desc", limit: 10 } }),
  ]);

  const dashboard = dbSummaryRes.data.data;
  const recentProducts = recentProductsRes.data.data.products || [];
  const categories = categoriesRes.data.data || [];
  const topProducts = topProductsRes.data.data.products || [];

  return {
    totalProducts: dashboard.summary.totalProducts ?? 0,
    totalCategories: dashboard.summary.totalCategories ?? 0,
    totalStockQty: dashboard.summary.totalStockQuantity ?? 0,
    totalValue: dashboard.summary.totalInventoryValue ?? 0,
    lowStockItems: dashboard.summary.lowStockCount ?? 0,
    outOfStockItems: dashboard.summary.outOfStockCount ?? 0,
    topProducts: topProducts.map((p: any) => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
      quantity: p.quantity,
    })),
    categoryDistribution: categories.map((c: any) => ({
      name: c.name,
      count: c.productCount || 0,
    })),
    recentProducts: recentProducts.map(mapProduct),
  };
}

// --- Products ---
export async function apiGetProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const params: Record<string, any> = {};
  if (filters.search) params.search = filters.search;
  if (filters.categoryId) params.category = filters.categoryId;
  if (filters.status) params.status = mapStatusToBackend(filters.status);
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.limit = filters.pageSize;

  const { data } = await client.get("/products", { params });
  const resData = data.data;

  return {
    data: (resData.products || []).map(mapProduct),
    total: resData.pagination.total,
    page: resData.pagination.page,
    pageSize: resData.pagination.limit,
    totalPages: resData.pagination.totalPages,
  };
}

export async function apiGetProduct(id: string): Promise<Product> {
  const { data } = await client.get(`/products/${id}`);
  return mapProduct(data.data);
}

export async function apiCreateProduct(data: ProductFormData): Promise<Product> {
  const payload = {
    name: data.name,
    sku: data.sku,
    category: data.categoryId,
    description: data.description,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    supplierName: data.supplierName,
  };
  const { data: response } = await client.post("/products", payload);
  return mapProduct(response.data);
}

export async function apiUpdateProduct(id: string, data: ProductFormData): Promise<Product> {
  const payload = {
    name: data.name,
    sku: data.sku,
    category: data.categoryId,
    description: data.description,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    supplierName: data.supplierName,
  };
  const { data: response } = await client.put(`/products/${id}`, payload);
  return mapProduct(response.data);
}

export async function apiDeleteProduct(id: string): Promise<void> {
  await client.delete(`/products/${id}`);
}

// --- Categories ---
export async function apiGetCategories(): Promise<Category[]> {
  const { data } = await client.get("/categories");
  return (data.data || []).map(mapCategory);
}

export async function apiCreateCategory(data: CategoryFormData): Promise<Category> {
  const { data: response } = await client.post("/categories", data);
  return mapCategory(response.data);
}

export async function apiUpdateCategory(id: string, data: CategoryFormData): Promise<Category> {
  const { data: response } = await client.put(`/categories/${id}`, data);
  return mapCategory(response.data);
}

export async function apiDeleteCategory(id: string): Promise<void> {
  await client.delete(`/categories/${id}`);
}

// --- Stock ---
export async function apiGetStockTransactions(): Promise<StockTransaction[]> {
  const { data } = await client.get("/transactions");
  return (data.data.transactions || []).map(mapTransaction);
}

export async function apiAdjustStock(productId: string, data: StockAdjustData, _adjustedBy: string): Promise<StockTransaction> {
  const payload = {
    type: data.operation === "increase" ? "INCREASE" : "DECREASE",
    amount: data.amount,
    reason: data.note,
  };
  const { data: response } = await client.patch(`/products/${productId}/stock`, payload);
  return mapTransaction(response.data.transaction);
}

export async function apiExportProducts(): Promise<string> {
  const { data } = await client.get("/products/export");
  return data;
}

export async function apiImportProducts(csvText: string): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
  const { data } = await client.post("/products/import", { csvText });
  return data.data;
}

export async function apiUpdateProfile(name: string): Promise<User> {
  const { data } = await client.put("/users/me", { name });
  const u = data.data;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
  };
}

export async function apiChangePassword(currentPassword, newPassword): Promise<void> {
  await client.put("/users/change-password", { currentPassword, newPassword });
}

export async function apiGetProductQRCode(productId: string): Promise<string> {
  const { data } = await client.get(`/products/${productId}/qrcode`);
  return data.data;
}
