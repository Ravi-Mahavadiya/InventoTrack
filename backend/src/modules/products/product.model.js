import mongoose from "mongoose";

export function computeStockStatus(quantity, threshold = 10) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= threshold) return "Low Stock";
  return "In Stock";
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: [0, "Quantity cannot be negative"], default: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    unitPrice: { type: Number, required: true, min: [0, "Unit price cannot be negative"] },
    supplierName: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: function () {
        return computeStockStatus(this.quantity, this.lowStockThreshold);
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure status is always accurate based on quantity and threshold
productSchema.pre("save", function (next) {
  this.status = computeStockStatus(this.quantity, this.lowStockThreshold);
  next();
});

export default mongoose.model("Product", productSchema);
