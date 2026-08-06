import { ProductShipping } from "./shipping";
import { ProductVariant } from "./variant";
import { ProductMedia } from "./media";
import { ProductSeo } from "./seo";
import { ProductSpecification } from "./specification";

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductPricing {
  price: number;
  discountPrice?: number;
  currency?: string;          // যেমন: "SAR", "BDT", "USD"
  discountStartDate?: string | Date;
  discountEndDate?: string | Date;
}

export interface ProductInventory {
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackOrder: boolean;
}

export interface ProductAttribute {
  name: string;   // যেমন: "Color", "Size"
  value: string;  // যেমন: "Midnight Black", "XL"
}

export interface ProductFlags {
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFuture: boolean;
  isDigital: boolean;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;                  // URL ফ্রেন্ডলি নামের জন্য অত্যন্ত জরুরি
  description: string;
  shortDescription?: string;     // প্রোডাক্ট কার্ড বা প্রিভিউয়ের জন্য
  brand?: string;
  sku?: string;
  category: string | Category;   // Category ID (string) অথবা Populated Category Object
  subCategory?: string;
  tags: string[];

  media: ProductMedia[];         // 'images' এর বদলে 'media' রাখা ভালো যেহেতু ভিডিও থাকতে পারে
  variants: ProductVariant[];

  pricing: ProductPricing;
  inventory: ProductInventory;
  shipping: ProductShipping;
  seo: ProductSeo;
  specifications: ProductSpecification[];
  attributes: ProductAttribute[];
  flags: ProductFlags;
  
  status: ProductStatus;

  ratingsAverage?: number;       // রিভিউ ও রেটিংসের জন্য
  ratingsQuantity?: number;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}
