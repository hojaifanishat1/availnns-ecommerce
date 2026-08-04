import { z } from "zod";

export const variantValidator = z.object({
  _id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  
  // Basic attributes
  size: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(), // কালার হেক্স কোড ভ্যালিডেশনের জন্য
  
  // Pricing & Inventory
  price: z.number().min(0, "Price cannot be negative"),
  compareAtPrice: z.number().min(0, "Compare price cannot be negative").optional(),
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().int().min(0).optional(),
  
  // Media & Status
  image: z.string().url("Invalid variant image URL").optional(),
  active: z.boolean().default(true),
}).refine((data) => {
  // লজিক্যাল চেক: ডিসকাউন্ট/কম্পেয়ার প্রাইস মূল দামের চেয়ে কম হতে হবে (যদি থাকে)
  if (data.compareAtPrice !== undefined && data.compareAtPrice > 0 && data.compareAtPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: "Compare at price must be greater than the regular price",
  path: ["compareAtPrice"],
});

export type VariantValidatorType = z.infer<typeof variantValidator>;
