import { Types } from "mongoose";

export interface IProductImage {
  url: string;

  public_id: string;
}

export interface IProductSpecification {
  key: string;

  value: string;
}

export interface IProduct {
  name: string;

  slug: string;

  description: string;

  category: Types.ObjectId;

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

  specifications?: IProductSpecification[];

  tags?: string[];

  // =========================
  // PRODUCT FLAGS
  // =========================

  isFeatured: boolean;

  isBestSeller: boolean;

  isNewArrival: boolean;

  isDeal: boolean;

  totalSold?: number; // <-- এই লাইনটি যুক্ত করা হয়েছে

  isPublished: boolean;

  isDigital: boolean;

  freeShipping: boolean;

  // =========================
  // REVIEWS
  // =========================

  rating: number;

  numReviews: number;

  // =========================
  // SEO
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
