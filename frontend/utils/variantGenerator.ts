import { ProductVariant } from "@/types/variant"; // প্রজেক্টের পাথ অনুযায়ী অ্যাডজাস্ট করে নিতে পারেন

export interface VariantOptions {
  sizes: string[];
  colors: string[];
  basePrice?: number; // ডিফল্ট বেস প্রাইস সেট করার অপশন
  baseSku?: string;   // এসকেউ জেনারেট করার জন্য প্রিফিক্স
}

/**
 * Generates product variants dynamically based on provided sizes and colors.
 * 
 * @param options - Object containing sizes and colors arrays, plus optional base pricing and SKU prefix
 * @returns Array of ProductVariant objects
 */
export default function variantGenerator({
  sizes = [],
  colors = [],
  basePrice = 0,
  baseSku = "PRD",
}: VariantOptions): ProductVariant[] {
  const variants: ProductVariant[] = [];

  // যদি সাইজ এবং কালার উভয়ই খালি থাকে
  if (sizes.length === 0 && colors.length === 0) {
    return variants;
  }

  // যদি শুধু সাইজ থাকে, কালার না থাকে
  if (colors.length === 0) {
    sizes.forEach((size) => {
      const cleanSize = size.trim();
      variants.push({
        sku: `${baseSku}-${cleanSize}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
        size: cleanSize,
        stock: 0,
        price: basePrice,
        active: true,
      });
    });
    return variants;
  }

  // যদি শুধু কালার থাকে, সাইজ না থাকে
  if (sizes.length === 0) {
    colors.forEach((color) => {
      const cleanColor = color.trim();
      variants.push({
        sku: `${baseSku}-${cleanColor}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
        color: cleanColor,
        stock: 0,
        price: basePrice,
        active: true,
      });
    });
    return variants;
  }

  // যদি সাইজ এবং কালার দুটোই থাকে (Cartesian Product)
  sizes.forEach((size) => {
    colors.forEach((color) => {
      const cleanSize = size.trim();
      const cleanColor = color.trim();
      
      const skuText = `${baseSku}-${cleanSize}-${cleanColor}`
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "");

      variants.push({
        sku: skuText,
        size: cleanSize,
        color: cleanColor,
        stock: 0,
        price: basePrice,
        active: true,
      });
    });
  });

  return variants;
}
