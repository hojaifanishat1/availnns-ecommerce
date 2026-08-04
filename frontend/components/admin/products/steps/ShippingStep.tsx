"use client";

import {
  useProductFormContext
} from "@/context/ProductFormContext";

import FormInput from "../shared/FormInput";

export default function ShippingStep() {
  const {
    form,
    updateNestedField
  } = useProductFormContext();

  const shipping = form.shipping || {
    weight: { value: 0, unit: "kg" },
    dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
    freeShipping: false
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Shipping Information
          </h2>
          <p className="text-sm text-gray-500">
            Manage package weight and dimensions for accurate delivery calculations.
          </p>
        </div>

        {/* Weight */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">
            Package Weight
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Weight (kg)"
              type="number"
              placeholder="0.00"
              value={shipping.weight?.value === 0 ? "" : shipping.weight?.value}
              onChange={(value) =>
                updateNestedField(
                  "shipping",
                  "weight",
                  {
                    ...shipping.weight,
                    value: value === "" ? 0 : Number(value)
                  }
                )
              }
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900">
            Package Dimensions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Length (cm)"
              type="number"
              placeholder="0"
              value={shipping.dimensions?.length === 0 ? "" : shipping.dimensions?.length}
              onChange={(value) =>
                updateNestedField(
                  "shipping",
                  "dimensions",
                  {
                    ...shipping.dimensions,
                    length: value === "" ? 0 : Number(value)
                  }
                )
              }
            />

            <FormInput
              label="Width (cm)"
              type="number"
              placeholder="0"
              value={shipping.dimensions?.width === 0 ? "" : shipping.dimensions?.width}
              onChange={(value) =>
                updateNestedField(
                  "shipping",
                  "dimensions",
                  {
                    ...shipping.dimensions,
                    width: value === "" ? 0 : Number(value)
                  }
                )
              }
            />

            <FormInput
              label="Height (cm)"
              type="number"
              placeholder="0"
              value={shipping.dimensions?.height === 0 ? "" : shipping.dimensions?.height}
              onChange={(value) =>
                updateNestedField(
                  "shipping",
                  "dimensions",
                  {
                    ...shipping.dimensions,
                    height: value === "" ? 0 : Number(value)
                  }
                )
              }
            />
          </div>
        </div>

        {/* Free Shipping */}
        <div className="pt-4 border-t flex items-center gap-3">
          <input
            type="checkbox"
            id="freeShipping"
            checked={Boolean(shipping.freeShipping)}
            onChange={(e) =>
              updateNestedField(
                "shipping",
                "freeShipping",
                e.target.checked
              )
            }
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
          />
          <label htmlFor="freeShipping" className="text-sm font-medium text-gray-900 cursor-pointer">
            Offer Free Shipping for this product
          </label>
        </div>
      </div>
    </div>
  );
}
