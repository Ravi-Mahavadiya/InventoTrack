import React, { useState } from "react";
import PropTypes from "prop-types";
import { X, Loader2 } from "lucide-react";
import { useAdjustStock } from "../../hooks/useProducts";

/**
 * Modal to adjust a product's stock levels.
 * @param {Object} props
 * @param {Object} props.product - The product being adjusted.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Closure callback.
 */
export default function StockAdjustModal({ product, isOpen, onClose }) {
  const [type, setType] = useState("INCREASE");
  const [amountStr, setAmountStr] = useState("1");
  const [reason, setReason] = useState("");
  const adjustStockMutation = useAdjustStock();

  if (!isOpen || !product) return null;

  const currentQuantity = product.quantity || 0;
  const amount = Math.max(0, parseInt(amountStr, 10) || 0);

  // Live calculation of resulting stock
  const resultingQuantity =
    type === "INCREASE" ? currentQuantity + amount : currentQuantity - amount;

  const isInvalid = type === "DECREASE" && resultingQuantity < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount < 1 || isInvalid) return;

    try {
      await adjustStockMutation.mutateAsync({
        id: product._id,
        payload: {
          type,
          amount,
          reason: reason.trim() || undefined,
        },
      });
      onClose();
    } catch (err) {
      // Handled in mutation hook toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-[460px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Adjust Stock levels</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl space-y-1 text-sm border border-zinc-100 dark:border-zinc-800/60">
            <p className="text-zinc-500 font-medium">Product: {product.name}</p>
            <p className="text-zinc-500 font-medium">SKU: {product.sku}</p>
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <span className="text-zinc-600 dark:text-zinc-400">Current Stock:</span>
              <span className="text-zinc-900 dark:text-zinc-100">{currentQuantity}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-zinc-600 dark:text-zinc-400">Resulting Stock:</span>
              <span className={isInvalid ? "text-red-500" : "text-emerald-600"}>
                {resultingQuantity}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Action Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="INCREASE">Increase Stock (+)</option>
                <option value="DECREASE">Decrease Stock (-)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Adjustment Amount</label>
              <input
                type="number"
                min="1"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Reason / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Supplier delivery, damage write-off, sales order"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {isInvalid && (
            <p className="text-xs font-medium text-red-500">
              Error: Adjustment would result in negative inventory value.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount < 1 || isInvalid || adjustStockMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-lg text-sm shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {adjustStockMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Confirm Adjust</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

StockAdjustModal.propTypes = {
  product: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
