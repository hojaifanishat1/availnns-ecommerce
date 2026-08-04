"use client";

import ProductWizard from "@/components/admin/products/ProductWizard";
import { PlusCircle } from "lucide-react";

export default function AddProductPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-white rounded-xl shadow-xs">
              <PlusCircle size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Add New Product
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Create a new product listing with detailed attributes, media gallery, inventory variants, and SEO.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <ProductWizard />
      </div>
    </div>
  );
}
