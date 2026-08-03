import {
  ProductShipping
} from "./shipping";


import {
  ProductVariant
} from "./variant";


import {
  ProductMedia
} from "./media";


import {
  ProductSeo
} from "./seo";


import {
  ProductSpecification
} from "./specification";


export type ProductStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";



export interface ProductPricing {

  price: number;


  discountPrice?: number;


  currency?: string;


  discountStartDate?: string;


  discountEndDate?: string;

}



export interface ProductInventory {

  stock: number;


  lowStockThreshold: number;


  trackInventory: boolean;


  allowBackOrder: boolean;

}



export interface ProductAttribute {

  name: string;


  value: string;

}



export interface ProductFlags {

  isFeatured: boolean;


  isBestSeller: boolean;


  isNewArrival: boolean;


  isDigital: boolean;

}



export interface Product {

  _id?: string;


  name: string;


  description: string;


  brand?: string;


  sku?: string;


  category: string;


  subCategory?: string;


  tags: string[];



  images: ProductMedia[];



  variants: ProductVariant[];



  pricing: ProductPricing;



  inventory: ProductInventory;



  shipping: ProductShipping;



  seo: ProductSeo;



  specifications: ProductSpecification[];



  attributes: ProductAttribute[];



  flags: ProductFlags;



  status: ProductStatus;



  createdAt?: string;


  updatedAt?: string;

}