import { Types } from "mongoose";


export interface IProductImage {

  url:string;

  public_id:string;

}



export interface IProductSpecification {

  key:string;

  value:string;

}



export interface IProduct {


  name:string;


  slug:string;


  description:string;


  category:Types.ObjectId;



  brand?:string;


  sku?:string;



  price:number;


  discountPrice?:number;


  discountStartDate?:Date;


  discountEndDate?:Date;



  stock:number;


  lowStockThreshold?:number;


  weight?:number;



  images:IProductImage[];



  sizes?:string[];


  colors?:string[];


  specifications?:IProductSpecification[];



  tags?:string[];



  isFeatured:boolean;


  isBestSeller:boolean;


  isNewArrival:boolean;


  isPublished:boolean;


  isDigital:boolean;


  freeShipping:boolean;



  rating:number;


  numReviews:number;



  metaTitle?:string;


  metaDescription?:string;



  warrantyPeriod?:string;


  storageCapacity?:string;


  ramSize?:string;


  screenSize?:string;


  processorType?:string;



  fabricType?:string;


  fitType?:string;


  waistRise?:string;


  material?:string;


  strapType?:string;


  soleMaterial?:string;


  capStyle?:string;



  createdAt?:Date;


  updatedAt?:Date;

}