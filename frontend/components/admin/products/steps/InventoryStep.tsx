"use client";

import {
  useProductFormContext
} from "@/context/ProductFormContext";

import FormInput from "../shared/FormInput";

export default function InventoryStep() {
  const {
    form,
    updateField
  } = useProductFormContext();

  const stock = form.stock === 0 || form.stock === undefined ? "" : form.stock;
  const lowStockThreshold = form.lowStockThreshold === 0 || form.lowStockThreshold === undefined ? "" : form.lowStockThreshold;

  const numericStock = typeof form.stock === "number" ? form.stock : 0;
  const numericThreshold = typeof form.lowStockThreshold === "number" ? form.lowStockThreshold : 0;

  const stockStatus =
    numericStock === 0
      ? "Out of Stock"
      : numericStock <= numericThreshold
      ? "Low Stock"
      : "In Stock";

  const statusBadgeColor =
    numericStock === 0
      ? "bg-red-50 text-red-700 border-red-200"
      : numericStock <= numericThreshold
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Inventory Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage stock quantity and low stock alert thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
          <FormInput
            label="Stock Quantity"
            type="number"
            placeholder="0"
            value={stock}
            onChange={(value) =>
              updateField(
                "stock",
                value === "" ? 0 : Number(value)
              )
            }
          />

          <FormInput
            label="Low Stock Threshold"
            type="number"
            placeholder="5"
            value={lowStockThreshold}
            onChange={(value) =>
              updateField(
                "lowStockThreshold",
                value === "" ? 0 : Number(value)
              )
            }
          />
        </div>

        <div className="border rounded-xl p-5 bg-gray-50/50 space-y-4">
          <h3 className="font-semibold text-gray-900">
            Inventory Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white rounded-lg border shadow-sm">
              <span className="text-gray-500 block text-xs">Current Stock</span>
              <span className="text-lg font-bold text-gray-900">{numericStock}</span>
            </div>

            <div className="p-3 bg-white rounded-lg border shadow-sm">
              <span className="text-gray-500 block text-xs">Low Stock Threshold</span>
              <span className="text-lg font-bold text-gray-900">{numericThreshold}</span>
            </div>

            <div className={`p-3 rounded-lg border shadow-sm flex flex-col justify-center ${statusBadgeColor}`}>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Status</span>
              <span className="text-base font-bold">{stockStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
