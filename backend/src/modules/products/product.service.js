import Product, { computeStockStatus } from "./product.model.js";
import Category from "../categories/category.model.js";

export const getProducts = async (query = {}) => {
  const {
    search,
    category,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Search by name or SKU
  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [{ name: searchRegex }, { sku: searchRegex }];
  }

  // Filter by Category
  if (category) {
    filter.category = category;
  }

  // Filter by Status
  if (status) {
    filter.status = status;
  }

  // Sorting setup
  const allowedSortFields = ["name", "quantity", "unitPrice", "createdAt", "status"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder === "asc" ? 1 : -1;
  const sortOptions = { [sortField]: order };

  // Pagination setup
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate("category", "name description slug");
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }
  return product;
};

export const createProduct = async (data) => {
  const formattedSku = data.sku.trim().toUpperCase();

  // Check unique SKU
  const existingSku = await Product.findOne({ sku: formattedSku });
  if (existingSku) {
    throw Object.assign(new Error(`Product with SKU '${formattedSku}' already exists`), { status: 409 });
  }

  // Verify category exists
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) {
    throw Object.assign(new Error("Selected category does not exist"), { status: 400 });
  }

  const threshold = data.lowStockThreshold !== undefined ? data.lowStockThreshold : 10;
  const status = computeStockStatus(data.quantity, threshold);

  const product = await Product.create({
    ...data,
    sku: formattedSku,
    status,
  });

  return await product.populate("category", "name slug");
};

export const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  if (data.sku) {
    const formattedSku = data.sku.trim().toUpperCase();
    if (formattedSku !== product.sku) {
      const existingSku = await Product.findOne({ sku: formattedSku });
      if (existingSku) {
        throw Object.assign(new Error(`Product with SKU '${formattedSku}' already exists`), { status: 409 });
      }
      product.sku = formattedSku;
    }
  }

  if (data.category && data.category !== product.category.toString()) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw Object.assign(new Error("Selected category does not exist"), { status: 400 });
    }
    product.category = data.category;
  }

  if (data.name !== undefined) product.name = data.name.trim();
  if (data.description !== undefined) product.description = data.description;
  if (data.unitPrice !== undefined) product.unitPrice = data.unitPrice;
  if (data.supplierName !== undefined) product.supplierName = data.supplierName;
  if (data.lowStockThreshold !== undefined) product.lowStockThreshold = data.lowStockThreshold;

  if (data.quantity !== undefined) {
    product.quantity = data.quantity;
  }

  // Re-calculate status
  product.status = computeStockStatus(product.quantity, product.lowStockThreshold);

  await product.save();
  return await product.populate("category", "name slug");
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  await Product.findByIdAndDelete(id);
  return { message: "Product deleted successfully" };
};
