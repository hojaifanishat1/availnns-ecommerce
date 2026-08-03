import {
ProductForm
} from "@/types/productForm";





export function validateProduct(

product:ProductForm

){



const errors:any={};





if(!product.name?.trim()){

errors.name="Product name is required";

}





if(!product.category){

errors.category="Category is required";

}





if(

!product.pricing.price ||

product.pricing.price <=0

){

errors.price="Price is required";

}







if(

!product.images ||

product.images.length===0

){

errors.images="Product image required";

}





if(product.stock < 0){

errors.stock="Invalid stock value";

}







return {


valid:Object.keys(errors).length===0,


errors



};



}