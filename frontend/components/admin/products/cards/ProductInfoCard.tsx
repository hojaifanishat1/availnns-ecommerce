"use client";

import {
  Package,
  Tag,
  Layers,
  Barcode,
  FolderTree,
} from "lucide-react";

interface ProductInfo {
  name?: string;
  sku?: string;
  category?: string;
  brand?: string;
  status?: string;
  [key: string]: unknown;
}

interface Props {
  product?: ProductInfo;
}

export default function ProductInfoCard({
  product = {}
}: Props) {
  const {
    name,
    sku,
    category,
    brand,
    status = "Active"
  } = product || {};

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
          justify-between
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
            <Package size={20} />
          </div>
          <div>
            <h3
              className="
                font-semibold
                text-lg
                text-gray-900
              "
            >
              Product Information
            </h3>
            <p className="text-xs text-gray-500">Core identification and categorization details.</p>
          </div>
        </div>

        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-100">
          {status}
        </div>
      </div>

      <div
        className="
          space-y-3
          divide-y
          divide-gray-100
        "
      >
        <div className="pt-3 first:pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            <Package size={16} />
            <span>Product Name</span>
          </div>
          <span className="font-bold text-sm text-gray-900 line-clamp-1">
            {
              name ||
              <span className="text-gray-400 font-normal italic">Product Name</span>
            }
          </span>
        </div>

        <div className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            <Barcode size={16} />
            <span>SKU</span>
          </div>
          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
            {
              sku || "-"
            }
          </span>
        </div>

        <div className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            <FolderTree size={16} />
            <span>Category</span>
          </div>
          <span className="font-medium text-sm text-gray-800">
            {
              category || "-"
            }
          </span>
        </div>

        {brand && (
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Tag size={16} />
              <span>Brand</span>
            </div>
            <span className="font-medium text-sm text-gray-800">
              {brand}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
