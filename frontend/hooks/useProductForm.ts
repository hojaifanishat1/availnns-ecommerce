"use client";


import {
useState,
useCallback
} from "react";


import {
ProductForm
} from "@/types/productForm";



export default function useProductForm(

initialData:ProductForm

){



const [

form,

setForm

]=useState<ProductForm>(

initialData

);




const updateField=(

field:keyof ProductForm,

value:any

)=>{


setForm(

prev=>(

{

...prev,

[field]:

value

}

)

);


};






const updateNestedField=(

parent:keyof ProductForm,

field:string,

value:any

)=>{


setForm(

prev=>(

{

...prev,

[parent]:

{

...(prev[parent] as any),

[field]:

value

}

}

)

);



};







const resetForm=()=>{


setForm(initialData);


};







const setFormData=(

data:ProductForm

)=>{


setForm(data);


};







return {


form,


setFormData,


updateField,


updateNestedField,


resetForm



};


}