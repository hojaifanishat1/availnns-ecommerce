"use client";

import {
  Truck,
  Box,
  Scale,
  Maximize2,
} from "lucide-react";

interface ShippingInfo {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

interface Props {
  shipping?: ShippingInfo;
}

export default function ShippingCard({
  shipping = {}
}: Props) {
  const {
    weight = 0,
    length = 0,
    width = 0,
    height = 0
  } = shipping || {};

  const dimensionsSummary = length || width || height
    ? `${length} × ${width} × ${height} cm`
    : "Dimensions not specified";

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
            <Truck size={20} />
          </div>
          <div>
            <h3
              className="
                font-semibold
                text-lg
                text-gray-900
              "
            >
              Shipping & Dimensions
            </h3>
            <p className="text-xs text-gray-500">Package weight and physical dimensions.</p>
          </div>
        </div>

        <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
          Physical
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="
            border
            border-gray-200
            rounded-xl
            p-4
            bg-gray-50/50
            flex
            items-center
            gap-3
          "
        >
          <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-xs text-gray-600">
            <Scale size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Package Weight</p>
            <p className="font-bold text-gray-900 mt-0.5">
              {weight} <span className="text-xs font-normal text-gray-500">kg</span>
            </p>
          </div>
        </div>

        <div
          className="
            border
            border-gray-200
            rounded-xl
            p-4
            bg-gray-50/50
            flex
            items-center
            gap-3
          "
        >
          <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-xs text-gray-600">
            <Maximize2 size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Dimensions (L × W × H)</p>
            <p className="font-bold text-gray-900 mt-0.5 text-sm">
              {dimensionsSummary}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-gray-100">
        <div className="text-center p-2">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Length</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{length} <span className="text-xs font-normal text-gray-500">cm</span></p>
        </div>
        <div className="text-center p-2 border-x border-gray-100">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Width</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{width} <span className="text-xs font-normal text-gray-500">cm</span></p>
        </div>
        <div className="text-center p-2">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Height</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{height} <span className="text-xs font-normal text-gray-500">cm</span></p>
        </div>
      </div>
    </div>
  );
}
