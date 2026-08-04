import { ProductAttribute } from "./product";
import { ProductMedia } from "./media";

export interface ProductVariant {
  _id?: string;
  sku: string;
  
  // Basic attributes
  size?: string;
  color?: string;
  colorHex?: string; // কালার পিকারের জন্য হেক্স কোড (যেমন: #000000)
  
  // Flexible attributes for custom variants (e.g. RAM, Storage, Material)
  attributes?: ProductAttribute[];
  
  // Pricing & Inventory
  price: number;              // মেইন প্রাইসের সাথে সামঞ্জস্য রাখতে বাধ্যতামূলক করা ভালো
  compareAtPrice?: number;    // ডিসকাউন্টের আগের মূল দাম
  stock: number;
  lowStockThreshold?: number; // স্টক অ্যালার্টের জন্য
  
  // Media & Status
  image?: string;             // অথবা ProductMedia অবজেক্ট ব্যবহার করা যেতে পারে
  media?: ProductMedia[];     // নির্দিষ্ট ভেরিয়েন্টের জন্য একাধিক ছবি থাকলে
  active: boolean;
}
