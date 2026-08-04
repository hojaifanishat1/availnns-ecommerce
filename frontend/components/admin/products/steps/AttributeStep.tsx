"use client";

import {
  Plus,
  Trash2,
} from "lucide-react";

import SectionCard
from "../shared/SectionCard";

import FormInput
from "../shared/FormInput";

import {
  useProductFormContext,
} from "@/context/ProductFormContext";

interface AttributeItem {
  name: string;
  value: string;
}

export default function AttributeStep() {
  const {
    form,
    updateField
  } = useProductFormContext();

  const attributes: AttributeItem[] =
    form.attributes || [];

  const addAttribute = () => {
    updateField(
      "attributes",
      [
        ...attributes,
        {
          name: "",
          value: ""
        }
      ]
    );
  };

  const removeAttribute = (
    index: number
  ) => {
    updateField(
      "attributes",
      attributes.filter(
        (_, i: number) =>
          i !== index
      )
    );
  };

  const updateAttribute = (
    index: number,
    key: keyof AttributeItem,
    value: string
  ) => {
    const updated =
      attributes.map(
        (item: AttributeItem, i: number) =>
          i === index
            ? {
                ...item,
                [key]: value
              }
            : item
      );

    updateField(
      "attributes",
      updated
    );
  };

  return (
    <div
      className="
        space-y-6
      "
    >
      <SectionCard
        title="Product Attributes"
        description="Add custom product properties and descriptive tags."
      >
        <button
          type="button"
          onClick={addAttribute}
          className="
            flex
            items-center
            gap-2
            bg-black
            text-white
            px-4
            py-2.5
            rounded-lg
            text-sm
            font-medium
            hover:bg-gray-800
            transition-colors
          "
        >
          <Plus size={18} />
          Add Attribute
        </button>

        <div
          className="
            space-y-4
            mt-5
          "
        >
          {attributes.length > 0 ? (
            attributes.map(
              (attribute: AttributeItem, index: number) => (
                <div
                  key={index}
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-12
                    gap-4
                    items-end
                    border
                    p-4
                    rounded-xl
                    bg-white
                    shadow-sm
                  "
                >
                  <div
                    className="
                      md:col-span-5
                    "
                  >
                    <FormInput
                      label="Attribute Name"
                      placeholder="e.g. Pattern, Fit, Sleeve"
                      value={attribute.name}
                      onChange={(value) =>
                        updateAttribute(
                          index,
                          "name",
                          value
                        )
                      }
                    />
                  </div>

                  <div
                    className="
                      md:col-span-6
                    "
                  >
                    <FormInput
                      label="Value"
                      placeholder="e.g. Solid, Regular, Long Sleeve"
                      value={attribute.value}
                      onChange={(value) =>
                        updateAttribute(
                          index,
                          "value",
                          value
                        )
                      }
                    />
                  </div>

                  <div
                    className="
                      md:col-span-1
                      flex
                      justify-center
                      pb-1
                    "
                  >
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="
                        p-2
                        text-red-500
                        hover:bg-red-50
                        rounded-lg
                        transition-colors
                      "
                      aria-label="Remove attribute"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50/50 text-gray-500 text-sm">
              No attributes added yet. Click &quot;Add Attribute&quot; to include custom properties.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
