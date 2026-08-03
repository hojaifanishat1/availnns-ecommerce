"use client";


import {

useState

} from "react";



import {

ProductSeo

} from "@/types/seo";







const DEFAULT_SEO:ProductSeo = {


metaTitle:"",


metaDescription:"",


slug:"",


keywords:[]


};








export default function useSeo(

initialData?:ProductSeo

){





const [

seo,

setSeo

]=useState<ProductSeo>(

initialData || DEFAULT_SEO

);







const updateSeo=(

field:keyof ProductSeo,

value:any

)=>{



setSeo(

prev=>(

{

...prev,

[field]:

value

}

)

);



};







const resetSeo=()=>{


setSeo(DEFAULT_SEO);


};







return {


seo,


setSeo,


updateSeo,


resetSeo



};


}