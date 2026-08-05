"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useProductFormContext
} from "@/context/ProductFormContext";

import { getCategories } from "@/services/category.service";
import { Category } from "@/types/category";
import generateSlug from "@/utils/generateSlug";
import generateSKU from "@/utils/generateSKU";
import FormInput from "../shared/FormInput";
import FormSelect from "../shared/FormSelect";
import FormTextarea from "../shared/FormTextarea";
import SectionCard from "../shared/SectionCard";
import { Sparkles } from "lucide-react";

export default function BasicInfoStep() {
  const {
    form,
    updateField,
    updateNestedField
  } = useProductFormContext();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (
      form.name && !form.slug
    ) {
      updateField(
        "slug",
        generateSlug(form.name)
      );
    }
  }, [
    form.name,
    form.slug,
    updateField
  ]);

  const handleGenerateSKU = () => {
    const sku = generateSKU("PRD");
    updateField(
      "sku",
      sku
    );
  };

  const parentCategories = categories.filter((category) => !category.parent);
  const subCategories = categories.filter((category) => {
    const parentId = typeof category.parent === "string" ? category.parent : (category.parent as any)?._id;
    return parentId === form.category;
  });

  return (
    <div className="space-y-6">
      <SectionCard
        title="Basic Information"
        description="Provide the core details of your product, including name, description, and categorization."
      >
        <div className="space-y-5">
          <FormInput
            label="Product Name"
            placeholder="e.g. Premium Cotton Oversized Hoodie"
            value={form.name || ""}
            onChange={(value) =>
              updateField(
                "name",
                value
              )
            }
          />

          <FormInput
            label="Brand"
            placeholder="e.g. Noptrix"
            value={form.brand || ""}
            onChange={(value) =>
              updateField(
                "brand",
                value
              )
            }
          />

          <FormTextarea
            label="Description"
            placeholder="Provide a detailed description of the product features, fabric, and usage..."
            value={form.description || ""}
            onChange={(value) =>
              updateField(
                "description",
                value
              )
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-8">
              <FormInput
                label="SKU (Stock Keeping Unit)"
                placeholder="e.g. PRD-XXXXX"
                value={form.sku || ""}
                onChange={(value) =>
                  updateField(
                    "sku",
                    value
                  )
                }
              />
            </div>

            <div className="md:col-span-4 pb-0.5">
              <button
                type="button"
                onClick={handleGenerateSKU}
                className="
                  w-full
                  px-4
                  py-2.5
                  rounded-lg
                  bg-black
                  text-white
                  text-sm
                  font-medium
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-gray-800
                  transition-colors
                "
              >
                <Sparkles size={16} />
                Generate SKU
              </button>
            </div>
          </div>

          <FormInput
            label="URL Slug"
            placeholder="e.g. premium-cotton-oversized-hoodie"
            value={form.slug || ""}
            onChange={(value) =>
              updateField(
                "slug",
                value
              )
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              value={form.category || ""}
              placeholder="Select a category"
              options={parentCategories.map((category) => ({
                label: category.name,
                value: category._id
              }))}
              onChange={(value) => {
                updateField("category", value);
                updateField("subCategory", "");
              }}
            />

            <FormSelect
              label="Sub Category"
              value={form.subCategory || ""}
              placeholder={form.category ? "Select a sub category" : "Select a parent category first"}
              options={subCategories.map((category) => ({
                label: category.name,
                value: category._id
              }))}
              onChange={(value) =>
                updateField(
                  "subCategory",
                  value
                )
              }
            />
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5">
            <h3 className="text-base font-semibold text-gray-900">Product Flags</h3>
            <p className="text-sm text-gray-500 mb-4">
              Mark this product as featured, best seller, new arrival, or digital for collection listings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.flags?.isFeatured)}
                  onChange={(e) =>
                    updateNestedField(
                      "flags",
                      "isFeatured",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-900">Featured Product</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.flags?.isBestSeller)}
                  onChange={(e) =>
                    updateNestedField(
                      "flags",
                      "isBestSeller",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-900">Best Seller</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.flags?.isNewArrival)}
                  onChange={(e) =>
                    updateNestedField(
                      "flags",
                      "isNewArrival",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-900">New Arrival</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.flags?.isDigital)}
                  onChange={(e) =>
                    updateNestedField(
                      "flags",
                      "isDigital",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-900">Digital Product</span>
              </label>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
