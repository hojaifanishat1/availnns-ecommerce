"use client";

import {
  useState
} from "react";

import {
  Plus
} from "lucide-react";
import { DefaultVariant } from "@/constants/variants";

interface Props {
  attributeLabel?: string; // ১. প্রপসটি এখানে রিসিভ করার জন্য ডিফাইন করা হলো
  onGenerate: (
    variants: DefaultVariant[]
  ) => void;
}

// সাধারণ কালারগুলোর জন্য নিখুঁত হেক্স ম্যাপিং
const getColorHex = (colorName: string): string => {
  const name = colorName.trim().toLowerCase();
  const hexMap: Record<string, string> = {
    red: "#EF4444",
    blue: "#3B82F6",
    black: "#000000",
    white: "#FFFFFF",
    green: "#10B981",
    yellow: "#F59E0B",
    gray: "#6B7280",
    grey: "#6B7280",
    purple: "#8B5CF6",
    pink: "#EC4899",
    orange: "#F97316",
    navy: "#1E3A8A",
    brown: "#92400E",
  };
  return hexMap[name] || "#000000";
};

export default function VariantGenerator({
  attributeLabel = "Size",
  onGenerate
}: Props) {
  const [
    sizes,
    setSizes
  ] = useState("");

  const [
    colors,
    setColors
  ] = useState("");

  // ২. ক্যাটেগরি অনুযায়ী জেনারেটরের লেবেল ডায়নামিক করার লজিক
  const getAttributeTitle = () => {
    if (attributeLabel.includes("RAM")) return "RAM & Storage (comma-separated)";
    if (attributeLabel.includes("Dial")) return "Dial / Strap Size (comma-separated)";
    if (attributeLabel.includes("Specification")) return "Specification / Type (comma-separated)";
    return "Sizes (comma-separated)";
  };

  const getPlaceholder = () => {
    if (attributeLabel.includes("RAM")) return "8GB/128GB, 12GB/256GB";
    if (attributeLabel.includes("Dial")) return "40mm, 44mm";
    if (attributeLabel.includes("Specification")) return "Standard, Pro";
    return "S, M, L, XL";
  };

  const generate = () => {
    const sizeList =
      sizes
        .split(",")
        .map(
          x => x.trim()
        )
        .filter(Boolean);

    const colorList =
      colors
        .split(",")
        .map(
          x => x.trim()
        )
        .filter(Boolean);

    const result: DefaultVariant[] = [];

    if (
      sizeList.length && colorList.length
    ) {
      sizeList.forEach(size => {
        colorList.forEach(color => {
          result.push({
            sku: `${size}-${color}`.toUpperCase(),
            size,
            color,
            colorHex: getColorHex(color),
            stock: 0,
            price: 0,
            discountPrice: 0,
            image: "",
            active: true
          });
        });
      });
    } else if (sizeList.length) {
      sizeList.forEach(size => {
        result.push({
          sku: size.toUpperCase(),
          size,
          color: "",
          colorHex: "",
          stock: 0,
          price: 0,
          discountPrice: 0,
          image: "",
          active: true
        });
      });
    } else if (colorList.length) {
      colorList.forEach(color => {
        result.push({
          sku: color.toUpperCase(),
          size: "",
          color,
          colorHex: getColorHex(color),
          stock: 0,
          price: 0,
          discountPrice: 0,
          image: "",
          active: true
        });
      });
    }

    onGenerate(result);
  };

  return (
    <div
      className="
        border
        rounded-xl
        p-5
        space-y-4
        bg-white
        shadow-sm
      "
    >
      <h3 className="font-semibold text-gray-900">
        Variant Generator
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {getAttributeTitle()}
          </label>
          <input
            type="text"
            className="
              border
              rounded-lg
              px-3
              py-2
              w-full
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
            placeholder={getPlaceholder()}
            value={sizes}
            onChange={(e) =>
              setSizes(e.target.value)
            }
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Colors (comma-separated)
          </label>
          <input
            type="text"
            className="
              border
              rounded-lg
              px-3
              py-2
              w-full
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
            placeholder="Red, Blue, Black"
            value={colors}
            onChange={(e) =>
              setColors(e.target.value)
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={generate}
        className="
          bg-black
          text-white
          px-4
          py-2.5
          rounded-lg
          flex
          items-center
          gap-2
          text-sm
          font-medium
          hover:bg-gray-800
          transition-colors
        "
      >
        <Plus size={18} />
        Generate Variants
      </button>
    </div>
  );
}
