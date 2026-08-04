"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ClipboardList,
} from "lucide-react";

import SectionCard
from "../shared/SectionCard";

import FormInput
from "../shared/FormInput";

import {
  useProductFormContext,
} from "@/context/ProductFormContext";

interface SpecificationItem {
  key: string;
  value: string;
}

export default function SpecificationStep() {
  const {
    form,
    updateField
  } = useProductFormContext();

  const [bulkText, setBulkText] = useState("");
  const specifications: SpecificationItem[] =
    form.specifications || [];

  const addSpecification = () => {
    updateField(
      "specifications",
      [
        ...specifications,
        {
          key: "",
          value: ""
        }
      ]
    );
  };

  const removeSpecification = (index: number) => {
    updateField(
      "specifications",
      specifications.filter(
        (_, i: number) => i !== index
      )
    );
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated =
      specifications.map(
        (item: SpecificationItem, i: number) =>
          i === index
            ? {
                ...item,
                [field]: value
              }
            : item
      );

    updateField(
      "specifications",
      updated
    );
  };

  const handleBulkAdd = () => {
    const parsed = bulkText
      .split(/\n|\r\n|\t|;|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      return;
    }

    const converted = parsed
      .map((entry) => {
        const separatorIndex = entry.indexOf(":") >= 0 ? entry.indexOf(":") : entry.indexOf("=");

        if (separatorIndex === -1) {
          return null;
        }

        const key = entry.slice(0, separatorIndex).trim();
        const value = entry.slice(separatorIndex + 1).trim();

        return key && value ? { key, value } : null;
      })
      .filter(Boolean) as SpecificationItem[];

    if (converted.length === 0) {
      return;
    }

    updateField("specifications", [...specifications, ...converted]);
    setBulkText("");
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Specifications"
        description="Add technical product specifications"
      >
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <ClipboardList size={16} />
            Bulk Add / Paste All
          </div>
          <p className="text-sm text-gray-500">
            Paste lines like: Material: Cotton, Weight: 250g, Color: Black
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste all specs here in one go..."
            className="w-full min-h-28 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBulkAdd}
              className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Add Bulk Specs
            </button>
            <button
              type="button"
              onClick={addSpecification}
              className="border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Add Single Row
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={addSpecification}
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
          Add Specification
        </button>

        <div className="space-y-4 mt-5">
          {specifications.length > 0 ? (
            specifications.map(
              (spec: SpecificationItem, index: number) => (
                <div
                  key={index}
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-12
                    gap-4
                    items-end
                    border
                    rounded-xl
                    p-4
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="md:col-span-5">
                    <FormInput
                      label="Key"
                      placeholder="e.g. Material, Brand, Battery"
                      value={spec.key}
                      onChange={(value) =>
                        updateSpecification(
                          index,
                          "key",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-6">
                    <FormInput
                      label="Value"
                      placeholder="e.g. 100% Cotton, Apple, 5000mAh"
                      value={spec.value}
                      onChange={(value) =>
                        updateSpecification(
                          index,
                          "value",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-center pb-1">
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="
                        p-2
                        text-red-500
                        hover:bg-red-50
                        rounded-lg
                        transition-colors
                      "
                      aria-label="Remove specification"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50/50 text-gray-500 text-sm">
              No specifications added yet. Click &quot;Add Specification&quot; to include technical details.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
