"use client";


import {

useState

} from "react";





export default function useVariants(

initial:any[]=[]

){



const [

variants,

setVariants

]=useState<any[]>(initial);






const addVariant=(variant:any)=>{


setVariants(

prev=>[

...prev,

variant

]

);


};







const updateVariant=(

index:number,

key:string,

value:any

)=>{


setVariants(

prev=>

prev.map(

(item,i)=>

i===index

?

{

...item,

[key]:

value

}

:

item

)

);


};







const removeVariant=(

index:number

)=>{


setVariants(

prev=>

prev.filter(

(_,i)=>

i!==index

)

);


};







const generateVariants=(

items:any[]

)=>{


setVariants(items);


};






return {


variants,


setVariants,


addVariant,


updateVariant,


removeVariant,


generateVariants



};


}