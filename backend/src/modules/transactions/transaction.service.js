import Transaction from "./transaction.model.js";
import Product, { computeStockStatus } from "../products/product.model.js";

export const adjustStock = async (productId, { type, amount, reason }, userId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  const previousQuantity = product.quantity;
  let newQuantity = previousQuantity;

  if (type === "INCREASE") {
    newQuantity = previousQuantity + amount;
  } else if (type === "DECREASE") {
    newQuantity = previousQuantity - amount;
    if (newQuantity < 0) {
      throw Object.assign(
        new Error(`Insufficient stock. Current stock is ${previousQuantity}, cannot decrease by ${amount}`),
        { status: 400 }
      );
    }
  }

  product.quantity = newQuantity;
  product.status = computeStockStatus(newQuantity, product.lowStockThreshold);
  await product.save();

  const transaction = await Transaction.create({
    product: product._id,
    type,
    quantity: amount,
    previousQuantity,
    newQuantity,
    reason: reason || (type === "INCREASE" ? "Manual Stock Increase" : "Manual Stock Decrease"),
    user: userId,
  });

  await product.populate("category", "name slug");

  return {
    product,
    transaction,
  };
};

export const getTransactions = async (query = {}) => {
  const { product, page = 1, limit = 10 } = query;
  const filter = {};

  if (product) {
    filter.product = product;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .populate("product", "name sku unitPrice status")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return {
    transactions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};
