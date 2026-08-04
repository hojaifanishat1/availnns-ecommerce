"use client";

import {
  useMemo,
} from "react";

interface Props {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  onChange?: (
    key: string,
    value: number
  ) => void;
}

export default function ShippingDimensions({
  weight = 0,
  length = 0,
  width = 0,
  height = 0,
  onChange
}: Props) {
  const volumetricWeight =
    useMemo(() => {
      return (
        length *
        width *
        height
      ) / 5000;
    }, [
      length,
      width,
      height
    ]);

  return (
    <div
      className="
        border
        rounded-xl
        p-5
        space-y-5
        bg-white
        shadow-sm
      "
    >
      <h3
        className="
          font-semibold
          text-lg
          text-gray-900
        "
      >
        Package Dimensions
      </h3>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={weight === 0 ? "" : weight}
            onChange={(e) =>
              onChange?.(
                "weight",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            className="
              border
              rounded-lg
              w-full
              px-3
              py-2
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Length (cm)
          </label>
          <input
            type="number"
            placeholder="0"
            value={length === 0 ? "" : length}
            onChange={(e) =>
              onChange?.(
                "length",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            className="
              border
              rounded-lg
              w-full
              px-3
              py-2
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Width (cm)
          </label>
          <input
            type="number"
            placeholder="0"
            value={width === 0 ? "" : width}
            onChange={(e) =>
              onChange?.(
                "width",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            className="
              border
              rounded-lg
              w-full
              px-3
              py-2
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            placeholder="0"
            value={height === 0 ? "" : height}
            onChange={(e) =>
              onChange?.(
                "height",
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            className="
              border
              rounded-lg
              w-full
              px-3
              py-2
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          />
        </div>
      </div>

      <div
        className="
          bg-gray-50
          border
          rounded-xl
          p-4
          flex
          items-center
          justify-between
        "
      >
        <span className="text-sm text-gray-600 font-medium">
          Calculated Volumetric Weight
        </span>
        <strong className="text-sm text-gray-900">
          {volumetricWeight.toFixed(2)} kg
        </strong>
      </div>
    </div>
  );
}
