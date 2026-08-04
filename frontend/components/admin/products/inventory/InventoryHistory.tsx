"use client";

import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";

interface InventoryRecord {
  _id?: string;
  previousStock: number;
  newStock: number;
  change: number;
  action?: string;
  createdAt?: string;
  user?: string;
}

interface Props {
  history: InventoryRecord[];
}

export default function InventoryHistory({
  history = []
}: Props) {
  return (
    <div
      className="
        border
        border-gray-200
        rounded-2xl
        p-6
        space-y-5
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          gap-2.5
        "
      >
        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
          <History size={20} />
        </div>
        <div>
          <h3
            className="
              font-semibold
              text-lg
              text-gray-900
            "
          >
            Inventory History
          </h3>
          <p className="text-xs text-gray-500">Track all stock adjustments, shipments, and returns.</p>
        </div>
      </div>

      {
        history.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Package size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">No inventory history</p>
              <p className="text-xs text-gray-500">Stock updates will be logged here automatically when modified.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {
              history.map(
                (item, index) => {
                  const isPositive = item.change >= 0;

                  return (
                    <div
                      key={item._id || index}
                      className="
                        border
                        border-gray-200
                        rounded-xl
                        p-4
                        flex
                        items-center
                        justify-between
                        bg-white
                        shadow-xs
                        hover:bg-gray-50/50
                        transition-colors
                      "
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                          {item.action || "Stock Updated"}
                          {item.user && (
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              by {item.user}
                            </span>
                          )}
                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-500
                            font-medium
                          "
                        >
                          {
                            item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : "Recent activity"
                          }
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >
                        <div className="text-right">
                          <div className="text-xs font-mono text-gray-500">
                            {item.previousStock} → {item.newStock}
                          </div>
                          <div className={`text-xs font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? `+${item.change}` : item.change} units
                          </div>
                        </div>

                        <div
                          className={`
                            p-2
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            ${
                              isPositive
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }
                          `}
                        >
                          {
                            isPositive ? (
                              <ArrowUpRight size={18} />
                            ) : (
                              <ArrowDownRight size={18} />
                            )
                          }
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            }
          </div>
        )
      }
    </div>
  );
}
