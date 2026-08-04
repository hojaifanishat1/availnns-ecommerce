"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  X,
  Layers,
  Sparkles,
} from "lucide-react";

interface VariantItem {
  size: string;
  color?: string;
  sku: string;
  stock: number;
  price: number;
  [key: string]: unknown;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (
    data: VariantItem[]
  ) => void;
}

export default function VariantGeneratorDialog({
  open,
  onClose,
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      setSizes("");
      setColors("");
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open)
    return null;

  const generate = () => {
    const sizeList = sizes
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    const colorList = colors
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    const result: VariantItem[] = [];

    sizeList.forEach(size => {
      if (colorList.length) {
        colorList.forEach(color => {
          result.push({
            size,
            color,
            sku: `${size.toLowerCase()}-${color.toLowerCase()}`.replace(/\s+/g, '-'),
            stock: 0,
            price: 0
          });
        });
      } else {
        result.push({
          size,
          sku: `${size.toLowerCase()}`.replace(/\s+/g, '-'),
          stock: 0,
          price: 0
        });
      }
    });

    onGenerate(result);
    onClose();
  };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/75
        backdrop-blur-xs
        flex
        items-center
        justify-center
        z-50
        p-4
        transition-opacity
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          rounded-2xl
          p-6
          w-full
          max-w-md
          space-y-6
          relative
          shadow-2xl
          border
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Layers size={18} className="text-gray-700" />
            </div>
            <h2
              className="
                font-bold
                text-lg
                text-gray-900
              "
            >
              Generate Variants
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              text-gray-400
              hover:text-gray-700
              p-1.5
              rounded-full
              hover:bg-gray-100
              transition-colors
            "
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700">
              Sizes (comma-separated)
            </label>
            <input
              type="text"
              className="
                w-full
                border
                border-gray-200
                rounded-xl
                px-3.5
                py-2.5
                text-sm
                text-gray-900
                bg-white
                placeholder:text-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-black
                focus:border-transparent
                transition-all
              "
              placeholder="e.g. S, M, L, XL"
              value={sizes}
              onChange={(e) =>
                setSizes(e.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700">
              Colors (optional, comma-separated)
            </label>
            <input
              type="text"
              className="
                w-full
                border
                border-gray-200
                rounded-xl
                px-3.5
                py-2.5
                text-sm
                text-gray-900
                bg-white
                placeholder:text-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-black
                focus:border-transparent
                transition-all
              "
              placeholder="e.g. Red, Blue, Black"
              value={colors}
              onChange={(e) =>
                setColors(e.target.value)
              }
            />
          </div>
        </div>

        <div
          className="
            flex
            justify-end
            gap-3
            pt-2
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              border
              border-gray-200
              hover:bg-gray-50
              text-gray-700
              px-4
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-colors
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={generate}
            disabled={!sizes.trim()}
            className="
              bg-black
              hover:bg-gray-800
              text-white
              px-5
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-colors
              shadow-xs
              flex
              items-center
              gap-2
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <Sparkles size={16} />
            <span>Generate Variants</span>
          </button>
        </div>
      </div>
    </div>
  );
}
