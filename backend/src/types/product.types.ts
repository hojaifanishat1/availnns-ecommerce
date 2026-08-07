import { Types } from "mongoose";

export interface IProductImage {
  url: string;
  public_id: string;
  alt?: string;
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProductAttribute {
  key: string;
  value: any;
}

export interface IProductVariant {
  sku?: string;
  size?: string;
  color?: string;
  colorHex?: string;
  stock?: number;
  price?: number;
  discountPrice?: number;
  image?: string;
  active?: boolean;
}

export interface IProduct {
  name: string;

  slug: string;

  description: string;

  shortDescription?: string;

  category: Types.ObjectId;

  subCategory?: Types.ObjectId;

  brand?: string;

  sku?: string;

  price: number;

  discountPrice?: number;

  discountStartDate?: Date;

  discountEndDate?: Date;

  stock: number;

  lowStockThreshold?: number;

  weight?: number;

  images: IProductImage[];

  sizes?: string[];

  colors?: string[];

  // =========================
  // PRODUCT VARIANTS
  // =========================
  variants?: IProductVariant[];

  specifications?: IProductSpecification[];

  attributes?: IProductAttribute[];

  tags?: string[];

  // =========================
  // PRODUCT STATUS & FLAGS
  // =========================
  status?: "draft" | "published" | "archived";

  isDraft?: boolean;

  isFeatured: boolean;

  isBestSeller: boolean;

  isNewArrival: boolean;

  isFuture: boolean;

  isDeal: boolean;

  totalSold?: number;

  isPublished: boolean;

  isDigital: boolean;

  freeShipping: boolean;

  // =========================
  // SHIPPING & SEO
  // =========================
  shippingClass?: "standard" | "express" | "free" | string;

  shipping?: Record<string, any>;

  seo?: Record<string, any>;

  categoryFields?: Record<string, any>;

  // =========================
  // REVIEWS
  // =========================
  rating: number;

  numReviews: number;

  // =========================
  // SEO META (Legacy fallback)
  // =========================
  metaTitle?: string;

  metaDescription?: string;

  // =========================
  // ELECTRONICS
  // =========================
  warrantyPeriod?: string;

  storageCapacity?: string;

  ramSize?: string;

  screenSize?: string;

  processorType?: string;

  // =========================
  // FASHION
  // =========================
  fabricType?: string;

  fitType?: string;

  waistRise?: string;

  material?: string;

  strapType?: string;

  soleMaterial?: string;

  capStyle?: string;

  // =========================
  // TIMESTAMPS
  // =========================
  createdAt?: Date;

  updatedAt?: Date;
}
