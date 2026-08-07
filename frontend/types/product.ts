export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface IProductImage {
  url: string;
  public_id: string;
  alt?: string;
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

export interface IProductSpecification {
  key: string;
  value: string;
}

// ✅ Added missing export types for ProductForm compatibility
export interface ProductAttribute {
  key: string;
  value: any;
}

export interface ProductFlags {
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFuture?: boolean;
  isDeal?: boolean;
  isDigital?: boolean;
  isPublished?: boolean;
  isDraft?: boolean;
  freeShipping?: boolean;
}

export interface ProductPricing {
  price: number;
  discountPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
}

export type ProductStatus = "draft" | "published" | "archived";

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  sku?: string;
  category: string | Category;
  subCategory?: string;

  // Pricing & Stock
  price: number;
  discountPrice?: number;
  discountPercentage?: number; // Backend utility theke ashe
  stock: number;
  lowStockThreshold?: number;
  weight?: number;

  // Images & Variants
  images: IProductImage[];
  variants?: IProductVariant[];
  sizes?: string[];
  colors?: string[];

  specifications?: IProductSpecification[];
  attributes?: ProductAttribute[];
  tags: string[];

  // Status & Flags
  status?: ProductStatus;
  isDraft?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFuture?: boolean;
  isDeal?: boolean;
  isDigital?: boolean;
  isPublished?: boolean;
  freeShipping?: boolean;
  totalSold?: number;

  // Shipping & SEO & Dynamic Fields
  shippingClass?: string;
  shipping?: Record<string, any>;
  seo?: Record<string, any>;
  categoryFields?: Record<string, any>;

  // Reviews & SEO
  rating?: number;          // অথবা ratingsAverage
  ratingsAverage?: number;
  numReviews?: number;      // অথবা ratingsQuantity
  ratingsQuantity?: number;
  metaTitle?: string;
  metaDescription?: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Fallbacks for older structure if needed
  pricing?: { price: number; discountPrice?: number };
  inventory?: { stock: number; lowStockThreshold?: number };
  flags?: { isBestSeller?: boolean; isNewArrival?: boolean };
}
