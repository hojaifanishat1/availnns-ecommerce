export interface ProductImage {
  url:string;
  public_id:string;
}


export interface Specification {
  key:string;
  value:string;
}


export interface Product {

  _id:string;

  name:string;

  slug:string;

  description:string;


  category:
  | string
  | {
      _id:string;
      name:string;
    };


  brand:string;


  price:number;

  discountPrice:number;


  discountPercentage?:number;


  discountStartDate?:string;

  discountEndDate?:string;


  stock:number;


  sku:string;


  images:ProductImage[];


  isNewArrival:boolean;

  isFeatured:boolean;

  isBestSeller:boolean;
  
  isDeal:boolean; // <-- Added isDeal here

  isPublished:boolean;


  rating:number;

  numReviews:number;


  tags:string[];



  // Product Variants

  sizes?:string[];

  colors?:string[];



  // Specifications

  specifications?:Specification[];



  // Electronics

  storageCapacity?:string;

  ramSize?:string;

  processorType?:string;



  // Fashion

  fabricType?:string;

  material?:string;



  warrantyPeriod?:string;



  freeShipping?:boolean;



  createdAt:string;

  updatedAt:string;

}
