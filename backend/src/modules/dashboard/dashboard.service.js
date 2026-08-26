import Product from "../products/product.model.js";
import Category from "../categories/category.model.js";
import Transaction from "../transactions/transaction.model.js";

export const getDashboardSummary = async () => {
  const [
    totalProducts,
    totalCategories,
    lowStockItems,
    outOfStockItems,
    stockAgg,
    recentTransactions,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Product.find({ status: "Low Stock" }).populate("category", "name slug").sort({ quantity: 1 }),
    Product.find({ status: "Out of Stock" }).populate("category", "name slug").sort({ name: 1 }),
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalStockQuantity: { $sum: "$quantity" },
          totalInventoryValue: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
        },
      },
    ]),
    Transaction.find()
      .populate("product", "name sku")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const totalStockQuantity = stockAgg.length > 0 ? stockAgg[0].totalStockQuantity : 0;
  const totalInventoryValue = stockAgg.length > 0 ? stockAgg[0].totalInventoryValue : 0;

  return {
    summary: {
      totalProducts,
      totalCategories,
      totalStockQuantity,
      totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
    },
    lowStockItems,
    outOfStockItems,
    recentTransactions,
  };
};
