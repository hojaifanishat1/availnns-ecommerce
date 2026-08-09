"use client";

import { useEffect } from "react";
import {
  useProductFormContext
} from "@/context/ProductFormContext";

import generateSKU from "@/utils/generateSKU";
import VariantGenerator from "../variants/VariantGenerator";
import VariantTableHeader from "../table/VariantTableHeader";
import VariantTableRow from "../table/VariantTableRow";
import { Plus } from "lucide-react";
import { DefaultVariant } from "@/constants/variants";

export default function VariantStep() {
  const {
    form,
    updateField
  } = useProductFormContext();

  // টাইপ এরর এড়াতে টাইপ অ্যাসার্শন ব্যবহার করা হয়েছে
  const variants: DefaultVariant[] = (form.variants as DefaultVariant[]) || [];

  // ভেরিয়েন্টের স্টক পরিবর্তন হলে অটো মোট স্টক আপডেট করার লজিক
  useEffect(() => {
    if (variants.length > 0) {
      const totalStock = variants.reduce((sum, variant) => {
        return sum + (Number(variant.stock) || 0);
      }, 0);
      
      if (form.stock !== totalStock) {
        updateField("stock", totalStock);
      }
    } else {
      if (form.stock !== 0) {
        updateField("stock", 0);
      }
    }
  }, [variants, form.stock, updateField]);

  const addVariant = () => {
    const newVariant: DefaultVariant = {
      sku: generateSKU("VAR"),
      size: "",
      color: "",
      colorHex: "#000000",
      stock: 0,
      price: form.pricing?.price || 0,
      discountPrice: 0,
      image: "",
      active: true,
    };

    updateField(
      "variants",
      [
        ...variants,
        newVariant
      ]
    );
  };

  const updateVariant = (
    index: number,
    key: string,
    value: unknown
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    updateField(
      "variants",
      updated
    );
  };

  const removeVariant = (
    index: number
  ) => {
    const updated = variants.filter(
      (_, i) => i !== index
    );

    updateField(
      "variants",
      updated
    );
  };

  const handleGenerate = (generatedVariants: any[]) => {
    const basePrice = form.pricing?.price || 0;
    
    const variantsWithDefaults: DefaultVariant[] = generatedVariants.map((v) => {
      // কালার অবজেক্ট বা স্ট্রিং থেকে সঠিক নাম ও হেক্স কোড বের করার লজিক
      let colorName = "";
      let colorHex = "#000000";

      if (typeof v.color === "object" && v.color !== null) {
        colorName = v.color.name || v.color.label || "";
        colorHex = v.color.hex || v.color.code || "#000000";
      } else if (typeof v.color === "string") {
        colorName = v.color;
        const hexMap: Record<string, string> = {
          red: "#EF4444",
          blue: "#3B82F6",
          black: "#000000",
          white: "#FFFFFF",
          green: "#10B981",
          yellow: "#F59E0B",
        };
        colorHex = hexMap[v.color.toLowerCase()] || "#000000";
      }

      return {
        ...v,
        color: colorName || v.color || "",
        colorHex: v.colorHex || colorHex,
        price: v.price || basePrice,
        discountPrice: v.discountPrice || 0,
      };
    });

    updateField(
      "variants",
      variantsWithDefaults
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Product Variants
          </h2>
          <p className="text-sm text-gray-500">
            Add size, color, stock, and pricing variations. Generate combinations quickly or create them manually.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          aria-label="Add a new product variant"
          className="
            px-4
            py-2.5
            rounded-lg
            bg-black
            text-white
            text-sm
            font-medium
            flex
            items-center
            gap-2
            hover:bg-gray-800
            transition-colors
          "
        >
          <Plus size={16} />
          Add Variant
        </button>
      </div>

      <VariantGenerator onGenerate={handleGenerate} />

      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900">
          Current Variants ({variants.length})
        </h3>

        {variants.length > 0 ? (
          <div className="overflow-x-auto">
            <VariantTableHeader />
            <div className="divide-y divide-gray-100 mt-2">
              {variants.map((variant, index) => (
                <VariantTableRow
                  key={index}
                  variant={variant}
                  index={index}
                  onChange={updateVariant}
                  onDelete={removeVariant}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50/50 text-gray-500 text-sm">
            No variants created yet. Use the Variant Generator above or click &quot;Add Variant&quot; to begin.
          </div>
        )}
      </div>
    </div>
  );
}
