"use client";


import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";


import {
  ProductForm
} from "@/types/productForm";





interface ContextType {

  form: ProductForm;

  updateField:(
    field:keyof ProductForm,
    value:any
  )=>void;


  updateNestedField:(
    parent:keyof ProductForm,
    field:string,
    value:any
  )=>void;


  setForm:(
    data:ProductForm
  )=>void;


  resetForm:()=>void;

}







const ProductFormContext =

createContext<ContextType | null>(null);









export function ProductFormProvider({

  children,

  initialData

}:{

  children:ReactNode;

  initialData:ProductForm;

}){



const [

form,

setForm

]=useState<ProductForm>(

initialData

);







// edit page / api data load হলে update হবে

useEffect(()=>{


setForm(initialData);


},[initialData]);









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









const contextValue = useMemo(()=>({


form,

updateField,

updateNestedField,

setForm,

resetForm


}),[form]);







return (

<ProductFormContext.Provider

value={contextValue}

>

{children}

</ProductFormContext.Provider>

);


}









export function useProductFormContext(){



const context = useContext(

ProductFormContext

);





if(!context){


throw new Error(

"useProductFormContext must be used inside ProductFormProvider"

);


}





return context;


}