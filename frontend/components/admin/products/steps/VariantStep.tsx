"use client";

import { useEffect, useMemo, useState } from "react";

import {
  useProductFormContext,
} from "@/context/ProductFormContext";

import { getCategories } from "@/services/category.service";
import { Category } from "@/types/category";

import generateSKU from "@/utils/generateSKU";

import VariantGenerator from "../variants/VariantGenerator";
import VariantTableHeader from "../table/VariantTableHeader";
import VariantTableRow from "../table/VariantTableRow";

import { Plus } from "lucide-react";
import { DefaultVariant } from "@/constants/variants";

export default function VariantStep() {
  const {
    form,
    updateField,
  } = useProductFormContext();

  const [categories, setCategories] = useState<Category[]>([]);

  const variants: DefaultVariant[] =
    (form.variants as DefaultVariant[]) || [];

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setCategories(data || []);
      } catch (error) {
        console.error(
          "Failed to load categories for variants:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  // =========================================================
  // FIND SELECTED CATEGORY NAME
  // =========================================================

  const selectedCategory = useMemo(() => {
    if (!form.category) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          String(category._id) ===
          String(form.category)
      ) || null
    );
  }, [categories, form.category]);

  // =========================================================
  // FIND SELECTED SUB CATEGORY NAME
  // =========================================================

  const selectedSubCategory = useMemo(() => {
    if (!form.subCategory) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          String(category._id) ===
          String(form.subCategory)
      ) || null
    );
  }, [categories, form.subCategory]);

  // =========================================================
  // CATEGORY + SUBCATEGORY NAME
  // =========================================================

  const categoryName =
    selectedCategory?.name?.toLowerCase() || "";

  const subCategoryName =
    selectedSubCategory?.name?.toLowerCase() || "";

  const combinedCategory =
    `${categoryName} ${subCategoryName}`
      .toLowerCase();

  // =========================================================
  // GET VARIANT ATTRIBUTE
  // =========================================================

  const attributeLabel = useMemo(() => {
    /*
     * MOBILE / PHONE
     */
    if (
      combinedCategory.includes("mobile") ||
      combinedCategory.includes("phone") ||
      combinedCategory.includes("smartphone")
    ) {
      return "RAM & Storage";
    }

    /*
     * LAPTOP / COMPUTER
     */
    if (
      combinedCategory.includes("laptop") ||
      combinedCategory.includes("computer") ||
      combinedCategory.includes("notebook")
    ) {
      return "RAM & Storage";
    }

    /*
     * TABLET
     */
    if (
      combinedCategory.includes("tablet") ||
      combinedCategory.includes("ipad")
    ) {
      return "RAM & Storage";
    }

    /*
     * WATCH
     */
    if (
      combinedCategory.includes("watch") ||
      combinedCategory.includes("smartwatch") ||
      combinedCategory.includes("band")
    ) {
      return "Dial / Strap";
    }

    /*
     * SHOES
     */
    if (
      combinedCategory.includes("shoe") ||
      combinedCategory.includes("footwear") ||
      combinedCategory.includes("sneaker") ||
      combinedCategory.includes("sandal")
    ) {
      return "Size";
    }

    /*
     * CLOTHING
     */
    if (
      combinedCategory.includes("cloth") ||
      combinedCategory.includes("clothing") ||
      combinedCategory.includes("apparel") ||
      combinedCategory.includes("fashion") ||
      combinedCategory.includes("shirt") ||
      combinedCategory.includes("t-shirt") ||
      combinedCategory.includes("tshirt") ||
      combinedCategory.includes("pant") ||
      combinedCategory.includes("jeans") ||
      combinedCategory.includes("dress") ||
      combinedCategory.includes("hoodie") ||
      combinedCategory.includes("jacket")
    ) {
      return "Size";
    }

    /*
     * ACCESSORIES
     */
    if (
      combinedCategory.includes("accessor") ||
      combinedCategory.includes("charger") ||
      combinedCategory.includes("cover") ||
      combinedCategory.includes("cable") ||
      combinedCategory.includes("headphone") ||
      combinedCategory.includes("earphone")
    ) {
      return "Specification";
    }

    /*
     * ELECTRONICS
     */
    if (
      combinedCategory.includes("electronic") ||
      combinedCategory.includes("gadget") ||
      combinedCategory.includes("device")
    ) {
      return "Specification";
    }

    /*
     * DEFAULT
     */
    return "Size";
  }, [combinedCategory]);

  // =========================================================
  // DEBUG
  // =========================================================

  useEffect(() => {
    console.log("========== VARIANT CATEGORY DEBUG ==========");
    console.log("Category ID:", form.category);
    console.log("Sub Category ID:", form.subCategory);
    console.log("Category Name:", selectedCategory?.name);
    console.log(
      "Sub Category Name:",
      selectedSubCategory?.name
    );
    console.log("Combined:", combinedCategory);
    console.log("Variant Attribute:", attributeLabel);
    console.log("============================================");
  }, [
    form.category,
    form.subCategory,
    selectedCategory,
    selectedSubCategory,
    combinedCategory,
    attributeLabel,
  ]);

  // =========================================================
  // RESET VARIANTS WHEN CATEGORY CHANGES
  // =========================================================

  useEffect(() => {
    /*
     * Category change হলে old variants রাখা হবে না।
     *
     * কিন্তু প্রথম render-এ unnecessary reset এড়াতে
     * category না থাকলে কিছু করব না।
     */

    if (!form.category) {
      return;
    }

    updateField("variants", []);
  }, [
    form.category,
    form.subCategory,
    updateField,
  ]);

  // =========================================================
  // AUTO TOTAL STOCK
  // =========================================================

  useEffect(() => {
    if (variants.length > 0) {
      const totalStock = variants.reduce(
        (sum, variant) =>
          sum + (Number(variant.stock) || 0),
        0
      );

      if (form.stock !== totalStock) {
        updateField(
          "stock",
          totalStock
        );
      }
    } else {
      if (form.stock !== 0) {
        updateField(
          "stock",
          0
        );
      }
    }
  }, [
    variants,
    form.stock,
    updateField,
  ]);

  // =========================================================
  // ADD VARIANT
  // =========================================================

  const addVariant = () => {
    const newVariant: DefaultVariant = {
      sku: generateSKU("VAR"),

      size: "",

      color: "",

      colorHex: "#000000",

      stock: 0,

      price:
        form.pricing?.price || 0,

      discountPrice: 0,

      image: "",

      active: true,
    };

    updateField(
      "variants",
      [
        ...variants,
        newVariant,
      ]
    );
  };

  // =========================================================
  // UPDATE VARIANT
  // =========================================================

  const updateVariant = (
    index: number,
    key: string,
    value: unknown
  ) => {
    const updated = [
      ...variants,
    ];

    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    updateField(
      "variants",
      updated
    );
  };

  // =========================================================
  // REMOVE VARIANT
  // =========================================================

  const removeVariant = (
    index: number
  ) => {
    const updated =
      variants.filter(
        (_, i) =>
          i !== index
      );

    updateField(
      "variants",
      updated
    );
  };

  // =========================================================
  // GENERATE VARIANTS
  // =========================================================

  const handleGenerate = (
    generatedVariants: DefaultVariant[]
  ) => {
    const basePrice =
      form.pricing?.price || 0;

    const variantsWithDefaults =
      generatedVariants.map(
        (v) => {
          let colorName = "";
          let colorHex =
            "#000000";

          if (
            typeof v.color ===
              "object" &&
            v.color !== null
          ) {
            const colorObject =
              v.color as any;

            colorName =
              colorObject.name ||
              colorObject.label ||
              "";

            colorHex =
              colorObject.hex ||
              colorObject.code ||
              "#000000";
          } else if (
            typeof v.color ===
            "string"
          ) {
            colorName =
              v.color;

            const hexMap:
              Record<
                string,
                string
              > = {
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

            colorHex =
              hexMap[
                v.color
                  .toLowerCase()
              ] ||
              "#000000";
          }

          return {
            ...v,

            size:
              v.size || "",

            color:
              colorName ||
              v.color ||
              "",

            colorHex:
              v.colorHex ||
              colorHex,

            price:
              v.price ||
              basePrice,

            discountPrice:
              v.discountPrice ||
              0,
          };
        }
      );

    updateField(
      "variants",
      variantsWithDefaults
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Product Variants
          </h2>

          <p className="text-sm text-gray-500">
            Add variations for{" "}
            <strong>
              {attributeLabel}
            </strong>
            , color, stock, and pricing.
            Generate combinations quickly
            or create them manually.
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
            cursor-pointer
          "
        >
          <Plus size={16} />
          Add Variant
        </button>

      </div>

      {/* GENERATOR */}
      <VariantGenerator
        attributeLabel={
          attributeLabel
        }
        onGenerate={
          handleGenerate
        }
      />

      {/* CURRENT VARIANTS */}
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">

        <div className="flex justify-between items-center">

          <h3 className="font-semibold text-gray-900">
            Current Variants (
            {variants.length}
            )
          </h3>

          <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-md">
            Active Attribute:{" "}
            <strong className="text-black">
              {attributeLabel}
            </strong>
          </span>

        </div>

        {variants.length >
        0 ? (
          <div className="overflow-x-auto">

            <VariantTableHeader
              attributeLabel={
                attributeLabel
              }
            />

            <div className="divide-y divide-gray-100 mt-2">

              {variants.map(
                (
                  variant,
                  index
                ) => (
                  <VariantTableRow
                    key={index}
                    variant={
                      variant
                    }
                    index={
                      index
                    }
                    attributeLabel={
                      attributeLabel
                    }
                    onChange={
                      updateVariant
                    }
                    onDelete={
                      removeVariant
                    }
                  />
                )
              )}

            </div>

          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50/50 text-gray-500 text-sm">
            No variants created yet.
            Use the Variant Generator
            above or click
            &quot;Add Variant&quot; to begin.
          </div>
        )}

      </div>

    </div>
  );
}