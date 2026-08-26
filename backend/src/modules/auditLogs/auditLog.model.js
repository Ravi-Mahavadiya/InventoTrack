import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    action: {
      type: String,
      required: true,
      enum: ["PRODUCT_CREATED", "PRODUCT_UPDATED", "PRODUCT_DELETED", "STOCK_ADJUSTED"],
      uppercase: true,
      trim: true
    },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    details: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
