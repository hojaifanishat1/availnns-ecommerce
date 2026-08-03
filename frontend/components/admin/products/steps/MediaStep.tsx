"use client";


import {
  useRef,
} from "react";


import SectionCard
from "../shared/SectionCard";


import {
  Upload,
  X,
  Star,
} from "lucide-react";


import {
  useProductFormContext,
} from "@/context/ProductFormContext";


import useImageUpload
from "@/hooks/useImageUpload";





export default function MediaStep(){



const {

form,

updateField

}=useProductFormContext();




const inputRef =
useRef<HTMLInputElement|null>(null);




const {

uploadImage,

uploading,

progress

}=useImageUpload();







const handleUpload = async(

e:React.ChangeEvent<HTMLInputElement>

)=>{


const files =
e.target.files;



if(!files)

return;




const uploadedImages:any[] = [

...form.images

];





for(

const file of Array.from(files)

){


const image =

await uploadImage(file);





uploadedImages.push({


...image,


isPrimary:

uploadedImages.length===0,


order:

uploadedImages.length


});



}




updateField(

"images",

uploadedImages

);



};








const removeImage=(index:number)=>{


const images =

form.images.filter(

(_:any,i:number)=>

i!==index

);



updateField(

"images",

images

);



};







const makePrimary=(index:number)=>{


const images =

form.images.map(

(image:any,i:number)=>({


...image,


isPrimary:

i===index


})


);



updateField(

"images",

images

);



};






return (

<div

className="
space-y-6
"

>



<SectionCard


title="Product Media"


description="Upload product images"

>



<input


ref={inputRef}


type="file"


multiple


accept="image/*"


hidden


onChange={handleUpload}


/>





<button


type="button"


onClick={()=>inputRef.current?.click()}


className="

flex

items-center

gap-2

border

px-4

py-2

rounded-lg

"


>


<Upload size={18}/>


Upload Images


</button>





{

uploading && (

<p>

Uploading {progress}%


</p>

)

}






<div

className="

grid

grid-cols-3

gap-4

mt-5

"

>


{

form.images.map(

(image:any,index:number)=>(


<div

key={index}

className="
relative
border
rounded-xl
overflow-hidden
"

>



<img

src={image.url}

alt={image.alt || "product"}

className="
w-full
h-40
object-cover
"

/>





<button


onClick={()=>removeImage(index)}


className="
absolute
top-2
right-2
bg-white
rounded-full
p-1
"

>


<X size={16}/>


</button>





<button


onClick={()=>makePrimary(index)}


className={`

absolute

bottom-2

left-2

px-2

py-1

rounded

text-xs

flex

items-center

gap-1

${

image.isPrimary

?

"bg-black text-white"

:

"bg-white"

}

`}


>


<Star size={12}/>


{

image.isPrimary

?

"Primary"

:

"Set Primary"

}


</button>





</div>



))

}


</div>



</SectionCard>


</div>


);


}