"use client";


import {
  useState
} from "react";



import {
  ProductMedia
} from "@/types/media";





export default function useMedia(

initial:ProductMedia[]=[]

){



const [

images,

setImages

]=useState<ProductMedia[]>(

initial

);





const addImage=(

image:ProductMedia

)=>{


setImages(

prev=>[

...prev,

image

]

);


};







const addImages=(

newImages:ProductMedia[]

)=>{


setImages(

prev=>[

...prev,

...newImages

]

);


};







const removeImage=(

index:number

)=>{


setImages(

prev=>

prev.filter(

(_,i)=>

i!==index

)

);


};







const updateImage=(

index:number,

data:Partial<ProductMedia>

)=>{


setImages(

prev=>

prev.map(

(item,i)=>

i===index

?

{

...item,

...data

}

:

item

)

);


};







const setPrimaryImage=(

index:number

)=>{


setImages(

prev=>

prev.map(

(item,i)=>(

{

...item,

isPrimary:

i===index

}

)

)

);


};







const reorderImages=(

newImages:ProductMedia[]

)=>{


setImages(newImages);


};







return {


images,


setImages,


addImage,


addImages,


removeImage,


updateImage,


setPrimaryImage,


reorderImages



};


}