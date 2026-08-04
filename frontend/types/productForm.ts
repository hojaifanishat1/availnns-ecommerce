import {
  ProductAttribute,
  ProductFlags,
  ProductPricing,
  ProductStatus,
} from "./product";
import { ProductSeo } from "./seo";
import { ProductSpecification } from "./specification";
import { ProductMedia } from "./media";
import { ProductShipping } from "./shipping";
import { ProductVariant } from "./variant";

// =========================
// Dynamic Category Fields
// =========================

export type CategoryFieldValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface ProductCategoryFields {
  [key: string]: CategoryFieldValue;
}

export type ShippingClassType = "standard" | "express" | "free";

export type FormStatusType = "draft" | "published" | "archived";

// =========================
// Product Form Data Structure
// =========================

export interface ProductForm {
  // Basic Information
  name: string;
  description: string;
  shortDescription?: string;
  brand: string;
  sku: string;
  slug: string;
  category: string;
  subCategory?: string;

  // Dynamic fields (e.g., Electronics: { ram: "8GB" }, Fashion: { fabric: "Cotton" })
  categoryFields: ProductCategoryFields;

  // Pricing & Inventory
  pricing: ProductPricing;
  stock: number;
  lowStockThreshold: number;

  // Shipping
  shipping: ProductShipping;
  shippingClass: ShippingClassType;

  // SEO & Marketing
  seo: ProductSeo;

  // Media & Variants
  images: ProductMedia[];
  variants: ProductVariant[];

  // Specs & Attributes
  specifications: ProductSpecification[];
  attributes: ProductAttribute[];
  tags: string[];

  // Status & Flags
  status: FormStatusType;
  flags: ProductFlags;
  isDraft: boolean;

  // Multi-Step Wizard Control
  completedSteps: number[];
  currentStep: number;
}

// =========================
// Form Errors & State Management
// =========================

export interface ProductFormErrors {
  [key: string]: string | undefined;
}

export interface ProductFormState {
  data: ProductForm;
  errors: ProductFormErrors;
  loading: boolean;
  saving: boolean;
  autoSaving: boolean;
  dirty: boolean;
}
