"use client";

import {
  Plus,
  Trash2,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";

interface Attribute {
  name: string;
  value: string;
}

interface Props {
  attributes: Attribute[];
  onChange: (
    attributes: Attribute[]
  ) => void;
}

export default function DynamicAttributes({
  attributes = [],
  onChange
}: Props) {
  const addAttribute = () => {
    onChange([
      ...attributes,
      {
        name: "",
        value: ""
      }
    ]);
  };

  const removeAttribute = (index: number) => {
    onChange(
      attributes.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  const updateAttribute = (
    index: number,
    key: keyof Attribute,
    value: string
  ) => {
    const updated =
      attributes.map(
        (item, i) =>
          i === index
            ? {
                ...item,
                [key]:
                  value
              }
            : item
      );

    onChange(updated);
  };

  return (
    <div
      className="
        border
        border-gray-200
        rounded-2xl
        p-6
        space-y-6
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
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <h3
              className="
                font-semibold
                text-lg
                text-gray-900
              "
            >
              Product Attributes
            </h3>
            <p className="text-xs text-gray-500">Define specifications like material, weight, or dimensions.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={addAttribute}
          className="
            bg-black
            hover:bg-gray-800
            text-white
            px-4
            py-2.5
            rounded-xl
            text-sm
            font-medium
            flex
            items-center
            gap-2
            transition-colors
            shadow-xs
          "
        >
          <Plus size={16} />
          Add Attribute
        </button>
      </div>

      {attributes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <ListFilter size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">No attributes added yet</p>
            <p className="text-xs text-gray-500">Click &quot;Add Attribute&quot; to specify custom key-value metadata for this product.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {
            attributes.map(
              (attribute, index) => (
                <div
                  key={index}
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-12
                    gap-3
                    items-center
                    p-3
                    border
                    border-gray-200
                    rounded-xl
                    bg-gray-50/50
                  "
                >
                  <div className="sm:col-span-5">
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
                      placeholder="Attribute Name (e.g. Material)"
                      value={attribute.name}
                      onChange={(e) =>
                        updateAttribute(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="sm:col-span-6">
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
                      placeholder="Value (e.g. 100% Cotton)"
                      value={attribute.value}
                      onChange={(e) =>
                        updateAttribute(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="
                        p-2
                        text-red-500
                        hover:bg-red-50
                        rounded-xl
                        transition-colors
                        border
                        border-transparent
                        hover:border-red-100
                      "
                      aria-label="Remove attribute"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            )
          }
        </div>
      )}
    </div>
  );
}
