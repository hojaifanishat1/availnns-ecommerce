"use client";

import {
  Trash2
} from "lucide-react";
import { DefaultVariant } from "@/constants/variants";

interface Props {
  variant: DefaultVariant;
  index: number;
  attributeLabel?: string;
  onChange: (
    index: number,
    key: string,
    value: unknown
  ) => void;
  onDelete: (
    index: number
  ) => void;
}

export default function VariantTableRow({
  variant,
  index,
  attributeLabel = "Size",
  onChange,
  onDelete
}: Props) {
  // ক্যাটেগরি অনুযায়ী ইনপুটের প্লেসহোল্ডার ডায়নামিক করার লজিক
  const getPlaceholder = () => {
    if (attributeLabel.includes("RAM")) return "RAM & Storage (e.g., 8GB/128GB)";
    if (attributeLabel.includes("Dial")) return "Dial / Strap";
    if (attributeLabel.includes("Specification")) return "Specification";
    return "Size (e.g., S, M, L)";
  };

  return (
    <div
      className="
        grid
        grid-cols-6
        gap-3
        items-center
        border-b
        py-3
        px-2
        hover:bg-gray-50/50
        transition-colors
      "
    >
      <input
        type="text"
        placeholder="SKU"
        value={variant.sku || ""}
        onChange={(e) =>
          onChange(
            index,
            "sku",
            e.target.value
          )
        }
        className="
          border
          rounded-lg
          px-3
          py-1.5
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-black
        "
      />

      <input
        type="text"
        placeholder={getPlaceholder()}
        value={variant.size || ""}
        onChange={(e) =>
          onChange(
            index,
            "size",
            e.target.value
          )
        }
        className="
          border
          rounded-lg
          px-3
          py-1.5
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-black
        "
      />

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={variant.colorHex || "#000000"}
          onChange={(e) =>
            onChange(
              index,
              "colorHex",
              e.target.value
            )
          }
          className="w-7 h-7 rounded border p-0.5 cursor-pointer shrink-0"
        />
        <input
          type="text"
          placeholder="Color"
          value={variant.color || ""}
          onChange={(e) =>
            onChange(
              index,
              "color",
              e.target.value
            )
          }
          className="
            border
            rounded-lg
            px-3
            py-1.5
            text-sm
            w-full
            focus:outline-none
            focus:ring-2
            focus:ring-black
          "
        />
      </div>

      <input
        type="number"
        placeholder="Stock"
        value={variant.stock === 0 ? "" : variant.stock}
        onChange={(e) =>
          onChange(
            index,
            "stock",
            e.target.value === "" ? 0 : Number(e.target.value)
          )
        }
        className="
          border
          rounded-lg
          px-3
          py-1.5
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-black
        "
      />

      <input
        type="number"
        placeholder="Price"
        value={variant.price === 0 ? "" : variant.price}
        onChange={(e) =>
          onChange(
            index,
            "price",
            e.target.value === "" ? 0 : Number(e.target.value)
          )
        }
        className="
          border
          rounded-lg
          px-3
          py-1.5
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-black
        "
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="
            p-1.5
            text-red-500
            hover:bg-red-50
            rounded-lg
            transition-colors
          "
          aria-label="Delete variant row"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
