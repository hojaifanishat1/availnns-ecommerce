import {
  ProductAttribute,
  ProductFlags,
  ProductPricing,
} from "./product";


import {
  ProductSeo,
} from "./seo";


import {
  ProductSpecification,
} from "./specification";


import {
  ProductMedia,
} from "./media";


import {
  ProductShipping,
} from "./shipping";


import {
  ProductVariant,
} from "./variant";




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

  [key:string]:CategoryFieldValue;

}






// =========================
// Product Form
// =========================

export interface ProductForm {



  // =========================
  // Basic Information
  // =========================


  name:string;


  description:string;


  brand:string;


  sku:string;


  slug:string;


  category:string;


  subCategory:string;



  // Dynamic fields
  // Example:
  // Electronics:
  // {ram:"8GB", storage:"256GB"}
  //
  // Fashion:
  // {fabric:"Cotton"}

  categoryFields:ProductCategoryFields;






  // =========================
  // Pricing
  // =========================


  pricing:ProductPricing;







  // =========================
  // Inventory
  // =========================


  stock:number;


  lowStockThreshold:number;







  // =========================
  // Shipping
  // =========================


  shipping:ProductShipping;



  shippingClass:
    | "standard"
    | "express"
    | "free";







  // =========================
  // SEO
  // =========================


  seo:ProductSeo;







  // =========================
  // Media
  // =========================


  images:ProductMedia[];







  // =========================
  // Variants
  // =========================


  variants:ProductVariant[];







  // =========================
  // Specifications
  // =========================


  specifications:ProductSpecification[];







  // =========================
  // Attributes
  // =========================


  attributes:ProductAttribute[];







  // =========================
  // Tags
  // =========================


  tags:string[];







  // =========================
  // Status
  // =========================


  status:

  | "draft"

  | "published"

  | "archived";







  // =========================
  // Flags
  // =========================


  flags:ProductFlags;







  // =========================
  // Draft
  // =========================


  isDraft:boolean;







  // =========================
  // Wizard
  // =========================


  completedSteps:number[];


  currentStep:number;



}








// =========================
// Form Errors
// =========================

export interface ProductFormErrors {


  [key:string]:string;


}








// =========================
// Form State
// =========================

export interface ProductFormState {



  data:ProductForm;



  errors:ProductFormErrors;



  loading:boolean;



  saving:boolean;



  autoSaving:boolean;



  dirty:boolean;



}