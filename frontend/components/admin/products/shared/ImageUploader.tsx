"use client";


import {

useRef

} from "react";


import useImageUpload from "@/hooks/useImageUpload";



interface Props {

onUpload:(

image:any

)=>void;

}



export default function ImageUploader({

onUpload

}:Props){



const inputRef =
useRef<HTMLInputElement|null>(null);



const {

uploadImage,

uploading,

progress,

error

}=useImageUpload();





const handleChange=async(

e:React.ChangeEvent<HTMLInputElement>

)=>{


const file =
e.target.files?.[0];



if(!file)

return;



const image =
await uploadImage(file);



onUpload(image);



};




return (

<div
className="
space-y-3
"
>


<button

type="button"

onClick={()=>inputRef.current?.click()}

className="
border
rounded-lg
px-4
py-2
"

>

Upload Image

</button>



<input

ref={inputRef}

type="file"

hidden

accept="image/*"

onChange={handleChange}

/>



{

uploading && (

<p>

Uploading {progress}%

</p>

)

}



{

error && (

<p
className="text-red-500"
>

{error}

</p>

)

}



</div>

);


}