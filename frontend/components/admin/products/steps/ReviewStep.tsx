"use client";

import SectionCard
from "../shared/SectionCard";

import {
  useProductFormContext
} from "@/context/ProductFormContext";

export default function ReviewStep() {
  const {
    form
  } = useProductFormContext();

  const primaryImage = form.images?.[0];
  const imageUrl = typeof primaryImage === "string" ? primaryImage : primaryImage?.url;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Product Review"
        description="Verify all details and configurations before saving your product."
      >
        <div className="space-y-6">
          {/* Basic Summary Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={form.name || "Product"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">No Image</span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                {form.name || "Untitled Product"}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {form.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-xl space-y-3 bg-white shadow-sm">
              <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wider border-pb pb-2">
                General Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <strong className="text-gray-900">{form.category || "Unassigned"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Price:</span>
                  <strong className="text-gray-900">
                    {form.pricing?.currency || "SAR"} {form.pricing?.price || 0}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Stock:</span>
                  <strong className="text-gray-900">{form.stock || 0}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-xl space-y-3 bg-white shadow-sm">
              <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wider border-pb pb-2">
                Assets & Variations
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Uploaded Images:</span>
                  <strong className="text-gray-900">{form.images?.length || 0}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Configured Variants:</span>
                  <strong className="text-gray-900">{form.variants?.length || 0}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Specifications:</span>
                  <strong className="text-gray-900">{form.specifications?.length || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
