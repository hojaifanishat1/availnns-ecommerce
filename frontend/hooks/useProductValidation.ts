"use client";


import {

useCallback

} from "react";



import {

ProductForm

} from "@/types/productForm";





interface ValidationResult {


valid:boolean;


errors:{

[key:string]:string;

};


}





export default function useProductValidation(){





const validate = useCallback(

(

form:ProductForm

):ValidationResult=>{



const errors:

{

[key:string]:string

}

={};






// =========================
// BASIC
// =========================


if(!form.name?.trim()){


errors.name =

"Product name is required";


}




if(!form.description?.trim()){


errors.description =

"Description is required";


}




if(!form.category){


errors.category =

"Category is required";


}







// =========================
// PRICING
// =========================


if(

!form.pricing?.price ||

form.pricing.price <= 0

){


errors.price =

"Valid price required";


}





if(

form.pricing?.discountPrice &&

form.pricing.discountPrice >

form.pricing.price

){


errors.discountPrice =

"Discount price cannot exceed regular price";


}








// =========================
// INVENTORY
// =========================


if(

form.stock < 0

){


errors.stock =

"Stock cannot be negative";


}






if(

form.lowStockThreshold < 0

){


errors.lowStockThreshold =

"Invalid stock threshold";


}







// =========================
// MEDIA
// =========================


if(

!form.images ||

form.images.length===0

){


errors.images =

"At least one product image required";


}







// =========================
// VARIANT
// =========================


if(

form.variants &&

form.variants.some(

(v:any)=>

v.stock < 0

)

){


errors.variants =

"Variant stock cannot be negative";


}







// =========================
// SEO
// =========================


if(

!form.seo?.slug

){


errors.slug =

"SEO slug required";


}







return {


valid:

Object.keys(errors).length===0,


errors



};





},[]);







return {


validate



};


}