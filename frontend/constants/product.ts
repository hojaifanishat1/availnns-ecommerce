import {
  ProductForm,
} from "@/types/productForm";





export const DEFAULT_PRODUCT_FORM: ProductForm = {



  // =========================
  // Basic Information
  // =========================

  name:"",

  description:"",

  brand:"",

  sku:"",

  slug:"",

  category:"",

  subCategory:"",


  // Dynamic category fields
  // Example:
  // Electronics:
  // {ram:"8GB", storage:"256GB"}
  //
  // Fashion:
  // {fabric:"Cotton"}

  categoryFields:{},







  // =========================
  // Pricing
  // =========================

  pricing:{


    price:0,


    discountPrice:0,


    currency:"SAR",


    discountStartDate:"",


    discountEndDate:"",


  },








  // =========================
  // Inventory
  // =========================

  stock:0,


  lowStockThreshold:5,









  // =========================
  // Shipping
  // =========================

  shipping:{



    weight:{


      value:0,


      unit:"kg",


    },



    dimensions:{


      length:0,


      width:0,


      height:0,


    },



    freeShipping:false,


  },








  shippingClass:"standard",







  // =========================
  // SEO
  // =========================

  seo:{


    metaTitle:"",


    metaDescription:"",


    slug:"",


    keywords:[],


  },









  // =========================
  // Media
  // =========================

  images:[],









  // =========================
  // Variants
  // =========================

  variants:[],









  // =========================
  // Specifications
  // =========================

  specifications:[],









  // =========================
  // Attributes
  // =========================

  attributes:[],









  // =========================
  // Tags
  // =========================

  tags:[],









  // =========================
  // Status
  // =========================

  status:"draft",







  // =========================
  // Flags
  // =========================

  flags:{


    isFeatured:false,


    isBestSeller:false,


    isNewArrival:false,


    isDigital:false,


  },









  // =========================
  // Draft
  // =========================

  isDraft:true,









  // =========================
  // Wizard
  // =========================

  completedSteps:[],


  currentStep:1,



};