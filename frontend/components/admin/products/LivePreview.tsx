"use client";

import {
  useProductFormContext
} from "@/context/ProductFormContext";

export default function LivePreview() {
  const {
    form
  } = useProductFormContext();

  const previewImage = form.images?.[0];
  const imageUrl = typeof previewImage === "string" ? previewImage : previewImage?.url;

  return (
    <div
      className="
        bg-white
        border
        rounded-xl
        p-5
        space-y-3
        shadow-sm
        sticky
        top-6
      "
    >
      <div className="border-b pb-2">
        <h2
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-gray-500
          "
        >
          Live Preview
        </h2>
      </div>

      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={form.name || "Product preview"}
            className="
              w-full
              h-full
              object-cover
            "
          />
        ) : (
          <span className="text-sm text-gray-400">No Image Available</span>
        )}
      </div>

      <div className="space-y-1">
        <h3
          className="
            text-lg
            font-bold
            text-gray-900
            line-clamp-1
          "
        >
          {form.name || "Product Name"}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {
            form.description ||
            "Product description will appear here..."
          }
        </p>
      </div>

      <div className="pt-2 border-t flex items-center justify-between">
        <span className="text-sm text-gray-500">Price</span>
        <span
          className="
            font-bold
            text-lg
            text-gray-900
          "
        >
          {form.pricing?.currency || "SAR"} {form.pricing?.price || 0}
        </span>
      </div>
    </div>
  );
}
