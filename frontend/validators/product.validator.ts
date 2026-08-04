import { z } from "zod";
import { mediaValidator } from "./mediaValidator"; // আগের মিডিয়া ভ্যালিডেটরটি এখানে রিইউজ করা হলো

export const productValidator = z.object({
  // Basic Information
  name: z.string().min(3, "Product name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  shortDescription: z.string().max(250, "Short description cannot exceed 250 characters").optional(),
  brand: z.string().optional(),
  sku: z.string().min(2, "SKU is required").optional(),
  slug: z.string().min(3, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),

  // Pricing
  pricing: z.object({
    price: z.number().min(0, "Price must be a positive number"),
    discountPrice: z.number().min(0, "Discount price cannot be negative").optional(),
    currency: z.string().default("SAR"),
    discountStartDate: z.string().optional(),
    discountEndDate: z.string().optional(),
  }).refine((data) => {
    // লজিক্যাল চেক: ডিসকাউন্ট প্রাইস মূল দামের চেয়ে বেশি হতে পারবে না
    if (data.discountPrice !== undefined && data.discountPrice >= data.price) {
      return false;
    }
    return true;
  }, {
    message: "Discount price must be less than the regular price",
    path: ["discountPrice"],
  }),

  // Inventory & Stock
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().int().min(0).default(5),

  // Media & Images (আগের মিডিয়া ভ্যালিডেটর ব্যবহার করা হয়েছে)
  images: z.array(mediaValidator).min(1, "At least one product image is required"),

  // Status & Flags
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
  
  tags: z.array(z.string()).default([]),
});

export type ProductValidatorType = z.infer<typeof productValidator>;
